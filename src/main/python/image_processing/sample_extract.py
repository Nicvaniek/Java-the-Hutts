from image_preprocessing.build_director import BuildDirector
from image_processing.text_manager import TextManager
from image_processing.simplification_manager import SimplificationManager
from image_processing.barcode_manager import BarCodeManager
import pytesseract
from PIL import Image
import cv2
import os

DESKTOP = os.path.join(os.path.join(os.path.expanduser('~')), 'Desktop')


class TextExtractor:
    """
        The TextExtractor extracts text from the ID image
    """
    def __init__(self, preferences):
        """
        Initialise Text Extractor.
        Authors(s):
            Nicolai van Niekerk
        Args:
            preferences (dict): User-specified CV techniques.
        Returns:
            None

        """
        self.preferences = preferences
        self.remove_face = 'false'

    def extract(self, img):
        """
        This function is a sample that demonstrates how text would be extracted
        Author(s):
            Nicolai van Niekerk
        Args:
            image: The image of the ID that contains the text to be extracted
        Returns:
            id_details: JSON obj (The extracted information)
        """
        if 'remove_face' in self.preferences:
            self.remove_face = self.preferences['remove_face'] == 'true'

        simplification_manager = SimplificationManager()
        barcode_manager = BarCodeManager()
        data = {}

        # Perform perspective transformation and read from barcode.
        image = simplification_manager.perspectiveTransformation(img)
        cv2.imwrite(DESKTOP + "/output/3.png", image)
        barcode_data_found, barcode_scan_data, barcoded_image = barcode_manager.get_barcode_info(image)
        if barcode_data_found:
            data = {
                'identity_number': barcode_scan_data.decode('utf-8'),
            }

        # Process image
        pipeline = BuildDirector.construct_text_extract_pipeline(self.preferences)
        image = pipeline.process_text_extraction(barcoded_image, self.remove_face)

        # Extract and return text
        filename = "{}.png".format(os.getpid())
        cv2.imwrite(filename, image)

        text = pytesseract.image_to_string(Image.open(filename))
        os.remove(filename)

        text_manager = TextManager()
        print(text, "\n------------------------------------------------------")
        clean_text = text_manager.clean_up(text, ['_'])
        print(clean_text, "\n -----------------------------------------------")
        id_details = text_manager.dictify(clean_text, data)
        print(id_details)
        return id_details


class FaceExtractor:
    """
        The FaceExtractor extracts the face region for the image passed.
    """
    def extract(self, img):
        """
        This function is a sample that demonstrates how the face would be extracted.
        Author(s):
            Stephan Nell
        Args:
            image: The image of the ID that contains the face that must be extracted.
        Returns:
            image: The extracted and aligned facial image.
        """
        simplification_manager = SimplificationManager()

        # Perform perspective transformation
        perspective_image = simplification_manager.perspectiveTransformation(img)
        cv2.imwrite(DESKTOP + "/output/10.png", perspective_image)

        # Process image
        pipeline = BuildDirector.construct_face_extract_pipeline()
        image = pipeline.process_face_extraction(perspective_image)

        return image
