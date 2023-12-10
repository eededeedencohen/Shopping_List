# import os

# def write_import_statements_to_txt():
#     # Get the current working directory
#     directory_path = os.getcwd()

#     # Get all file names in the directory
#     file_names = os.listdir(directory_path)

#     # Filter out non-PNG image files
#     image_files = [f for f in file_names if f.endswith('.png')]

#     # Create import statements for each PNG image file and write them to a text file
#     with open(os.path.join(directory_path, 'import_statements.txt'), 'w') as file:
#         for image_file in image_files:
#             # Remove file extension for variable name
#             variable_name = os.path.splitext(image_file)[0]
#             # this format: import Img7290115201703 from "./images/7290115201703.png";
#             statement = f'import Img{variable_name} from "./images/{image_file}";\n'
#             file.write(statement)

# # Call the function to execute
# write_import_statements_to_txt()


#====================================================================================
#------------------------------------------------------------------------------------
#====================================================================================
import os

def write_import_statements_and_cases_to_txt():
    # Get the current working directory
    # directory_path = os.getcwd()
    # directory_path is './new' folder
    directory_path = './new'

    # Get all file names in the directory
    file_names = os.listdir(directory_path)

    # Filter out non-PNG image files
    image_files = [f for f in file_names if f.endswith('.png')]

    # Create import statements and switch cases for each PNG image file, and write them to a text file
    with open(os.path.join(directory_path, 'image_imports.txt'), 'w') as file:
        for image_file in image_files:
            # Remove file extension for variable name
            variable_name = os.path.splitext(image_file)[0]


            # Write switch case statement
            # case_statement = f'    case "{variable_name}":\n      return Img{variable_name};\n'
            case_statement = f'import Img{variable_name} from "./images/{image_file}";\n'
            file.write(case_statement)

# Call the function to execute
write_import_statements_and_cases_to_txt()