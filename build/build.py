#! /usr/bin/env python

import os
import re
import subprocess
from datetime import date


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


def build_command(output_name, dependencies, output_dependencies):
    cat = \
"""
echo '////////////////////////////////////////' ; 
echo '// source: %s' ;
cat %s ; 
echo '' ; 
"""
    cat = cat.lstrip()
    cat = "".join([cat % (
        output_dependency,
        dependency,
    ) for dependency, output_dependency in zip(dependencies, output_dependencies)])
    cat = cat.rstrip()
    
    command = \
"""
(echo '/**' ; 
echo ' * @license %s' ; 
echo ' *' ;
echo ' * Copyright (C) %d Mike Kibbel, MetaMetrics, Inc.' ; 
echo ' * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE' ; 
echo ' */' ; 
echo '' ; 
echo '(function($, window, document) {' ;
echo '' ;
echo 'var $pt = $.platinum = $.platinum || { };' ;
echo '' ;
%s 
echo '' ;
echo '////////////////////////////////////////' ; 
echo '' ;
echo '})(jQuery, window, document);' )
"""
    command = command.strip()
    command = command % (
        output_name, 
        date.today().year,
        cat,
    )
    
    return command


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
            
            # Create the dependencies' output names.
            output_dependencies = ["jquery.platinum-%s" % os.path.basename(dependency) for dependency in dependencies]
            
            # Get the output directory.
            output_dir, output_name = os.path.split(input_name)
            output_dir = os.path.join(output_dir, "..")
            
            # Build the output filenames.
            output_name, ext = os.path.splitext(output_name)
            if output_name != "platinum":
                output_min_name = "jquery.platinum-%s.min%s" % (output_name, ext)
                output_name = "jquery.platinum-%s%s" % (output_name, ext)
            else:
                output_min_name = "jquery.platinum.min.js"
                output_name = "jquery.platinum.js"
            
            # Build the full output paths.
            output_min_path = os.path.join(output_dir, output_min_name)
            output_path = os.path.join(output_dir, output_name)
            
            # Build.
            print u"Building %s" % input_name
            command = build_command(output_name, dependencies, output_dependencies)
            
            # Create unminified files
            subprocess.call(
                "%s > %s" % (
                    command,
                    output_path,
                ),
                shell=True,
            )            
            
            # Create minified files with Google Closure Compiler
            subprocess.call(
                "%s | java -jar %s > %s" % (
                    command,
                    cc_name,
                    output_min_path,
                ),
                shell=True,
            )
