#! /usr/bin/env python

import os
import re
import subprocess


# Regular expression for matching JavaScript source filenames
rx_source = re.compile(r'[-a-z0-9.]+(?<!min)\.js')

# Find dependencies for a given file.
def find_dependencies(filename, visited=None):    
    # Keep track of what files we've already visited
    visited = set() if visited is None else visited
    visited.add(filename)
    
    dirname = os.path.dirname(filename)
    required = []
    next_required = []
    
    # Find the required filenames on the first line of the source.
    with open(filename, "rb") as source:
        next_required = [os.path.join(dirname, next_filename) for next_filename in rx_source.findall(source.readline())]
    
    # Recurse.
    for next_filename in next_required:
        if next_filename not in visited:
            required = required + find_dependencies(next_filename, visited)
    
    # This file is also required.
    required = required + [filename]
    return required


if __name__ == "__main__":
    input_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    cc_name = os.path.join(os.path.dirname(__file__), "google-cc/compiler.jar")
    input_names = []
    
    for input_name in os.listdir(input_path):
        input_name = os.path.join(input_path, input_name)
        
        if rx_source.search(input_name) and \
            os.path.isfile(input_name):
            
            # Keep track of all the input filenames.
            input_names.append(input_name)
            
            output_dir, output_name = os.path.split(input_name)
            output_dir = os.path.join(output_dir, "dist")
            output_name, ext = os.path.splitext(output_name)
            output_name = "%s.min%s" % (output_name, ext)
            output_name = os.path.join(output_dir, output_name)
            
            # Find all dependencies.
            dependencies = find_dependencies(input_name)
            
            # Build all the dependencies wrapped in a closure with
            # Google Closure Compiler.
            print u"Building %s" % input_name
            subprocess.call(
                "(echo '(function(jQuery) {' ; cat %s ; echo '})(jQuery);') | java -jar %s > %s" % (
                    " ".join(dependencies),
                    cc_name,
                    output_name,
                ),
                shell=True,
            )
