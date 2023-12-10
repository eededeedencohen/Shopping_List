# from rembg import remove
# from PIL import Image


# input_path = 'new2/80954521.png'

# output_path = 'new2/80954521_t.png'

# input = Image.open(input_path)

# output = remove(input)

# output.save(output_path)

from rembg import remove
from PIL import Image
import os

input_folder = 'lastImages/'
output_folder = 'new/'

# Create the output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Iterate over all files in the input folder
for file_name in os.listdir(input_folder):
# for file_name in ['835811008941.png']:
    if file_name.endswith('7290005201882.png'):  # Check if the file is a PNG image
        input_path = os.path.join(input_folder, file_name)

        # Generate the output path
        output_path = os.path.join(output_folder, file_name)

        # Open the input image, remove the background, and save the output image
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)