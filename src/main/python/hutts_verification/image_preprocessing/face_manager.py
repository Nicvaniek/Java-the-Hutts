"""
Wraps all the functionality necessary for extracting a face from an image.
"""

import os
from pathlib import Path
import cv2
import dlib
from imutils.face_utils import FaceAligner
from imutils.face_utils import rect_to_bb
from hutts_verification.utils.hutts_logger import logger
from hutts_verification.utils.pypath import correct_path

__authors__ = "Stephan Nell, Nicolai van Niekerk"
__copyright__ = "Copyright 2017, Java the Hutts"
__license__ = "BSD"
__maintainer__ = "Stephan Nell"
__email__ = "nellstephanj@gmail.com"
__status__ = "Development"

TEMPLATE_DIR = correct_path(Path(os.path.abspath(os.path.dirname(__file__)), 'templates'))
FACE_NOT_FOUND_PLACE_HOLDER = cv2.imread(TEMPLATE_DIR + "/profile.jpg")


class FaceDetector:
    """
    The FaceDetector class is responsible for:

    1. Detecting the face.
    2. Extracting a face from an image.
    3. Applying blurring on a detected face in an image.

    """
    def __init__(self, shape_predictor_path):
        """
        Initialise Face Detector Manager.

        :param shape_predictor_path (str): Describes the path to the Shape Predictor trained data.

        """
        self.shape_predictor_path = shape_predictor_path
        self.predictor = dlib.shape_predictor(self.shape_predictor_path)
        self.detector = dlib.get_frontal_face_detector()
        self.face_aligner = FaceAligner(self.predictor, desiredFaceWidth=256)

    def detect(self, image):
        """
        This function detects the face in the image passed.
        By making use of the dlib HOG feature image_preprocessing and linear classifier for frontal face detection
        we are able to detect the face with less false-positive results and without a major time penalty.
        More Information dlib frontal_face detection: http://dlib.net/imaging.html#get_frontal_face_detector

        A check will be done to see if a face is present in the image.
        If a face is not detected in the image the execution should log that the face was not found and continue
        with execution. This is due to the fact that face detection might not be critical to
        a function (like with text extraction) and rather be used to increase accuracy.

        :param image (obj): OpenCV image containing the face we need to detect.

        Raises:
            - ValueError: If no face can be detected.

        Returns:
            - list(int): This list contains the box coordinates for the region in which the face resides.

        """
        rectangles = self.detector(image, 1)
        if len(rectangles) == 0:
            logger.warning('No valid face found. Returning None')
        return rectangles[0] if rectangles else None

    def extract_face(self, image):
        """
        This function finds a face in the image passed and is optimised
        to align the face before being returned.

        :param image (obj): Image containing the face we need to detect and extract.

        Raises:
            - ValueError: If no face can be detected.

        Returns:
            - (obj): An image of the aligned face.

        """
        rectangle = self.detect(image)
        if rectangle is None:
            return FACE_NOT_FOUND_PLACE_HOLDER
        face_aligned = self.face_aligner.align(image, image, rectangle)
        return face_aligned

    def blur_face(self, image):
        """
        This function find the faces and apply a blurring effect on the detected region.
        After the region has been blurred, the blurred region is reapplied to the original image.
        Blurring the face is implemented as a method in the attempt to reduce noise when extracting
        text from the image later in the image pipeline.

        :param image (obj): OpenCV image containing the face we need to detect and blur.

        Raises:
            - ValueError: If no face can be detected.

        Returns:
            - (obj): A copy of the image with blurring applied to the face in the image.

        """
        rectangle = self.detect(image)
        if rectangle is None:
            logger.warning('No face found. Facial Blur ignored.')
            return image
        (x, y, w, h) = rect_to_bb(rectangle)
        # To Extend the entire region of face since face detector does not include upper head.
        y = y-75
        h = h+75
        sub_face = image[y:y + h, x:x + w]
        sub_face = cv2.dilate(sub_face, None, iterations=3)
        sub_face = cv2.GaussianBlur(sub_face, (31, 31), 0)
        image[y:y + sub_face.shape[0], x:x + sub_face.shape[1]] = sub_face
        return image
