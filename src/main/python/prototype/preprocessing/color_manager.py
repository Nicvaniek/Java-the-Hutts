import cv2
import numpy as np


class ColorManager:
    """
    The Color manager is responsible for applying several color management techniques
    to image passed.
    """
    def __init__(self):
        """
        Initialise the Colour Manager
        """
        print("Initialise Color Manager")

    def histEqualisation(self, image):
        """
        This function applies histogram equalisation to the image passed
        Author(s):
            Stephan Nell
        Args:
            image (:obj:'OpenCV image'): Image to which histogram equalisation should be applied to.
        Returns:
            obj:'OpenCV image': The Histogram equalised image.
        """
        return cv2.equalizeHist(image)

    def extractChannel(self, image, image_channel="green"):
        """
        This function extracts a selected color channel from an image.
        Author(s):
            Stephan Nell
        Args:
            image (:obj:'OpenCV image'): Image to which image channel should be removed
            str: Color that should be removed valid color red, green, blue
        Returns:
            obj:'OpenCV image': A copy of the image passed but with a color channel removed
        Todo:
            Add additional checks for invalid color name
        """
        (B, G, R) = cv2.split(image)
        zeros = np.zeros(image.shape[:2], dtype="uint8")

        if image_channel == "green":
            return cv2.merge([B, zeros, R])
        elif image_channel == "blue":
            return cv2.merge([zeros, G, R])
        else:
            return cv2.merge([B, G, zeros])

    def blackHat(self, image, rect_kernel_size=(13, 7)):
        """
        This function applies blackhat color changes to the image passed
        Author(s):
            Stephan Nell
        Args:
            image (:obj:'OpenCV image'): Image to which black hat color changes should be
                applied to
            Integer list: Represent the kernel dimension by which blackHat morphology
                changes should be applied to.
        Returns:
            obj:'OpenCV image': A modified copy of the image where blackHat morphology was
                applied to an image.
        Todo:
            Add additional checks for invalid kernel sizes
        """
        rectangle_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, rect_kernel_size)
        return cv2.morphologyEx(image.copy(), cv2.MORPH_BLACKHAT, rectangle_kernel)

    def topHat(self, image, rect_kernel_size=(13, 7)):
        """
        This function applies tophat color changes to the image passed
        Author(s):
            Stephan Nell
        Args:
            image (:obj:'OpenCV image'): Image to which top hat color changes should be
                applied to.
            Integer list: Represent the kernel dimension by which topHat  morphology
                changes should be applied to.
        Returns:
                applied to an image.
        Todo:
            Add additional checks for invalid kernel sizes
        """
        rectangle_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, rect_kernel_size)
        return cv2.morphologyEx(image, cv2.MORPH_TOPHAT, rectangle_kernel)