#! /usr/bin/env python

import os
import re
import subprocess


# Regular expression for matching JavaScript source filenames
rx_source = re.compile(r'[-a-z0-9.]+\.js')

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
    input_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
    cc_name = os.path.join(os.path.dirname(__file__), "google-cc/compiler.jar")
    input_names = []
    
    for input_name in os.listdir(input_path):
        input_name = os.path.join(input_path, input_name)
        
        if rx_source.search(input_name) and \
            os.path.isfile(input_name):
            
            # Keep track of all the input filenames.
            input_names.append(input_name)
            
            # Find all dependencies.
            dependencies = find_dependencies(input_name)
            
            # Build the output filenames
            output_dir, output_name = os.path.split(input_name)
            output_dir = os.path.join(output_dir, "..")
            
            output_name, ext = os.path.splitext(output_name)
            if output_name != "platinum":
                output_min_name = "jquery.platinum-%s.min%s" % (output_name, ext)
                output_name = "jquery.platinum-%s%s" % (output_name, ext)
            else:
                output_min_name = "jquery.platinum.min.js"
                output_name = "jquery.platinum.js"
            
            output_min_name = os.path.join(output_dir, output_min_name)
            output_name = os.path.join(output_dir, output_name)
            
            print u"Building %s" % input_name
            command = "(echo '(function(jQuery) {' ; echo '' ; %s echo '})(jQuery);')" % (
                " ".join(["cat %s ; echo '' ; echo '////////////////////' ;" % dependency for dependency in dependencies])
            )
            
            # Create unminified files
            subprocess.call(
                "%s > %s" % (
                    command,
                    output_name,
                ),
                shell=True,
            )            
            
            # Create minified files with Google Closure Compiler
            subprocess.call(
                "%s | java -jar %s > %s" % (
                    command,
                    cc_name,
                    output_min_name,
                ),
                shell=True,
            )
