/*
Author(s): Nicolai van Niekerk, Justin van Tonder
*/

/* global $ */

var SERVER_BASE_URL = "http://localhost:5000";
var PATH_TO_PIPELINE = "/home/minion/Desktop/output/";

// Enum for pipeline type
PipelineType = {
	TEXT: 0,
	PROFILE: 1
};

$(document).ready(function () {

	// Remove webhost ad div
	$('a').each(function() {
		if ($(this).attr('title') == 'Hosted on free web hosting 000webhost.com. Host your own website for FREE.') {
			$(this).parent().remove();
		}
	});

	// Attempt to deal with sticky hover
	if ($(window).width() < 994) {
		disableHoverEffects();
	}

	// Hide some content
	$('.initially-hidden').hide();

	// Initialize slide menu buttons
	$('.slide-btn').sideNav({
		menuWidth: 300,
		closeOnClick: true
	});

	// Hide existing side navs
	$('.slide-btn').on('click', function () {
		// Not the best fix... but workable
		if ($('#sidenav-overlay').css('opacity') === '1') {
			$('#sidenav-overlay').trigger('click');
		}
	});

	// Materialise component initialization
	$("select").material_select();

	$('.datepicker').pickadate({
		selectMonths: true,		 // Creates a dropdown to control month
		selectYears: 120, 		 // Creates a dropdown of n years to control year,
		format: 'yyyy-mm-dd',	 //	Date format,
		closeOnSelect: false, 	 // Close upon selecting a date,
		max: new Date() 		 // Set the max date to today to get only previous dates. 
	});

	// Testing -- Remove
	$('.test-circle').circliful({
		percent: 88.8,
		text: 'Profile',
		textBelow: true,
		decimals: 2,
		alwaysDecimals: true,
		foregroundColor: '#80cbc4',
		backgroundColor: 'none',
		fillColor: '#eee',
		foregroundBorderWidth: 4,
		iconColor: '#80cbc4',
		icon: 'f007',
		iconSize: '30',
		iconPosition: 'middle',
		targetPercent: $('#verification-threshold').val()
	});

	// Image pipeline initialisation
	$('.pipeline').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		centerMode: false,
		infinite: false,
		focusOnSelect: true,
		responsive: [{
			breakpoint: 601,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}, {
			breakpoint: 993,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		}]
	});

	// Initialise collapsibles
	$('.collapsible').collapsible({
		onOpen: function () {
			// Change caret symbol when expanding collapsibles
			$('.collapsible-header').each(function (el) {
				$(this).hasClass("active") ?
				$(this).children('.carets').text("chevron_right") :
				$(this).children('.carets').text('expand_more');
				// Refresh slick carousels
				$('.pipeline').slick('setPosition');
				// Clear ID previews
				clearIDPreviews();
				// Clear extract fields
				clearExtractFields();
				// Clear verification fields
				clearVerificationFields();
			});
		},
		onClose: function () {
			// Change caret symbol when expanding collapsibles
			$('.collapsible-header').each(function (el) {
				$(this).hasClass('active') ?
				$(this).children('.carets').text('chevron_right') :
				$(this).children('.carets').text('expand_more');
			});
		}
	});

	// Click event to scroll to top
	$('.scroll-top').on('click', function () {
		$('html, body').animate({ scrollTop: 0 }, 800);
		return false;
	});

	// Click event to scroll to bottom
	$('.scroll-bottom').on('click', function () {
		$('html, body').animate({ scrollTop: $('body').height() }, 800);
		return false;
	});

	// Result modal initialisation
	$('.modal').modal({
		endingTop: '20%',
	});

	// Verify
	$('#verify-btn').on('click', function (e) {
		// Check if inputs are valid
		if (!verifyInputCheck()) return;

		var formData = {};
		var idPhoto = document.getElementById("id-photo-verify").files[0];
		var userImage = document.getElementById("profile-photo").files[0];
		var names = $("#names-verify").val();
		var surname = $("#surname-verify").val();
		var idNumber = $("#identity_number-verify").val();
		var nationality = $("#nationality-verify").val();
		var cob = $("#country_of_birth-verify").val();
		var status = $("#status-verify").val();
		var gender = $("#sex-verify").val();
		var dob = $("#date_of_birth-verify").val();

		formData["names"] = names;
		formData["surname"] = surname;
		formData["idNumber"] = idNumber;
		formData["nationality"] = nationality;
		formData["cob"] = cob;
		formData["status"] = status;
		formData["gender"] = gender;
		formData["dob"] = dob;

		// Add preferences and ID type
		addPreferences(formData);

		// Toggle I/O
		var io = $('#pipeline_switch').is(':checked');
		formData['useIO'] = io;

		// Clear circliful graphs
		$('.circle-result').html('');

		// Hide previous detailed results
		$('#detailed-results').hide();

		// Hide previous verbose verify text results
		$('#text-verify-details-card').hide();

		// Ensure that the pre-loader spinner is visible
		$('#verify-result .modal-content .spinner').show();
		var ditto = ellipses('#verify-ditto');

		var verify = function () {
			if (formData["id_img"] && formData["face_img"]) {
				var success = function (data) {
					// Populate circular graphs
					populateCircleGraphs(data);

					// Hide loader and stop loader timer
					$('#verify-result .modal-content .spinner').hide();
					clearInterval(ditto);

					// Populate and unhide pipeline
					if($('#pipeline_switch').is(':checked')){
						populatePipeline(PipelineType.TEXT, 8);
						// populatePipeline(PipelineType.PROFILE, 6);
						$('#text-pipeline').show(600);
						// $('#profile-pipeline').show(600);
					}

					// Show the view details button
					$('.circle-results-wrapper, #verify-result.modal .modal-footer')
					.show(500);

					// Populate the detailed results
					populateDetailedResults(data);

					// Unhide the detailed results section
					$('#detailed-results').show(600);

					// Populate the detailed results section
					if (typeof data.text_match === 'object') {
						// Show the verbose text verify results.
						$('#text-verify-details-card').show(600);
					}

				};
				var error = function() {
					$('#verify-result').modal('close');
					$('#verify-result .modal-content .spinner').hide();
					clearInterval(ditto);
					$('#error').modal('open');
				};
				ajax(SERVER_BASE_URL + "/verifyID", JSON.stringify(formData), success, error);
			}
		}
		var reader1 = new FileReader();
		reader1.readAsDataURL(idPhoto);
		reader1.onload = function() {
			formData["id_img"] = reader1.result.toString();
			verify();
		};

		var reader2 = new FileReader();
		reader2.readAsDataURL(userImage);
		reader2.onload = function() {
			formData["face_img"] = reader2.result.toString();
			verify();
		};

		// Open up result modal
		$('#verify-result.modal .modal-footer').hide();
		$('#verify-result').modal('open');
	});

	// View detailed results button click event
	$('.btn-details').on('click', function() {
		$('.collapsible-main').collapsible('open', 4);
		setTimeout(function() {
			$('html, body').animate({ scrollTop: $('#details-anchor').offset().top}, 800);
		}, 200);
	});

	// Hover compare cards on compare button hover
	$('#verify-btn, .extraction-options button').hover(function () {
		if ($(window).width() >= 994) {
			$('.duo-card').addClass('duo-card-hover');
		}
	}, function () {
		$('.duo-card').removeClass('duo-card-hover');
	});

	// Clear all extracted fields when an extract button is clicked
	$('.extraction-options button').on('click', function() {
		clearExtractFields();
	});

	// Extract text
	$('#extract-text-btn').on('click', function (e) {
		// Check if inputs are valid
		if (!extractInputCheck()) return;

		// Display a pre-loader while waiting
		var ditto = ellipses('#extract-ditto');
		$('#extract-loader').modal('open');

		var formData = {};
		var idPhoto = document.getElementById('id-photo-extract').files[0];
		formData['idPhoto'] = idPhoto;

		// Add preferences and ID type
		addPreferences(formData);

		// Toggle I/O
		var io = $('#pipeline_switch').is(':checked');
		formData['useIO'] = io;

		var reader = new FileReader();
		reader.readAsDataURL(idPhoto);
		reader.onload = function() {
			formData['idPhoto'] = reader.result.toString();
			var success = function (data) {
				// Hide pre-loader
				$('.loader-overlay').hide(600);
				clearInterval(ditto);

				// Handle the case involving a UP card, if a UP card
				// was used as an input image
				$("input[id$=extract]").each(function () {
					var id = $(this).attr("id").replace("-extract", "");
					if (id != "id-photo") {
						$(this).focus();
						$(this).val(data[id]);
						$(this).blur();
					}
				});

				// Populate and unhide pipeline
				if($('#pipeline_switch').is(':checked')){
					populatePipeline(PipelineType.TEXT, 8);
					$('#text-pipeline').show(600);
				}
				$('#extract-loader').modal('close');
			};

			var error = function() {
				// Hide loader
				$('#extract-loader').modal('close');
				clearInterval(ditto);
				$('#error').modal('open');
			};
			ajax(SERVER_BASE_URL + "/extractText", JSON.stringify(formData), success, error);
		};
	});

	// Extract profile
	$('#extract-photo-btn').on('click', function (e) {
		// Check if inputs are valid
		if (!extractInputCheck()) return;

		// Display a pre-loader while waiting
		var ditto = ellipses('#extract-ditto');
		$('#extract-loader').modal('open');

		var formData = {};
		var idPhoto = document.getElementById('id-photo-extract').files[0];
		formData['idPhoto'] = idPhoto;

		// Toggle I/O
		var io = $('#pipeline_switch').is(':checked');
		formData['useIO'] = io;

		addPreferences(formData);

		var reader = new FileReader();
		reader.readAsDataURL(idPhoto);
		reader.onload = function () {
			formData['idPhoto'] = reader.result.toString();
			var success = function (data) {
				// Hide pre-loader
				$('.loader-overlay').hide(600);
				clearInterval(ditto);

				var face = jQuery.parseJSON(data)
				document.getElementById("face-preview-extract").src = face.extracted_face;

				// Populate and unhide pipeline
				if($('#pipeline_switch').is(':checked')){
					// populatePipeline(PipelineType.PROFILE, 6);
					// $('#profile-pipeline').show(600);
				}
				$('#extract-loader').modal('close');
			};

			var error = function() {
				// Hide loader
				$('#extract-loader').modal('close');
				clearInterval(ditto);
				$('#error').modal('open');
			};

			ajax(SERVER_BASE_URL + "/extractFace", JSON.stringify(formData), success, error);
		};
	});

	// Extract all
	$('#extract-all-btn').on('click', function (e) {
		// Check if inputs are valid
		if (!extractInputCheck()) return;

		// Display a pre-loader while waiting
		var ditto = ellipses('#extract-ditto');
		$('#extract-loader').modal('open');

		var formData = {};
		var idPhoto = document.getElementById('id-photo-extract').files[0];
		var reader = new FileReader();
		reader.readAsDataURL(idPhoto);
		reader.onload = function () {
			formData['idPhoto'] = reader.result.toString();
			var io = $('#pipeline_switch').is(':checked');
			formData['useIO'] = io;
			var success = function (data) {
				// Hide pre-loader
				$('.loader-overlay').hide(600);
				clearInterval(ditto);
				
				// Parse the response
				var cardComponents = jQuery.parseJSON(data);
				// Populate text fields
				$("input[id$=extract]").each(function () {
					var id = $(this).attr("id").replace("-extract", "");
					if (id != "id-photo") {
						$(this).focus();
						if (cardComponents.text_extract_result) {
							$(this).val(cardComponents.text_extract_result[id]);
						}
						$(this).blur();
					}
				});

				// Show face
				document.getElementById("face-preview-extract").src = cardComponents.extracted_face;

				// Populate and unhide pipeline
				if($('#pipeline_switch').is(':checked')){
					populatePipeline(PipelineType.TEXT, 8);
					// populatePipeline(PipelineType.PROFILE, 6);
					$('#text-pipeline').show(600);
					// $('#profile-pipeline').show(600);
				}
				$('#extract-loader').modal('close');
			};
			var error = function() {
				// Hide loader
				$('#extract-loader').modal('close');
				clearInterval(ditto);
				$('#error').modal('open');
			};
			// Add preferences and ID type
			addPreferences(formData);

			ajax(SERVER_BASE_URL + "/extractAll", JSON.stringify(formData), success, error);
		};

	});

	// Make sure you can only extract one channel
	$(".channel_extractors").change(function () {
		var currentID = $(this).attr('id');
		$(".channel_extractors").each(function (index) {
			if ($(this).attr('id') != currentID)
				$(this).prop('checked', false);
		});
	});

	// Enable and Disable Auto Settings
	$('#auto_settings').change(function () {
		if ($(this).is(':checked')) {
			$('.text-switch').prop('checked', false);
			$('.text-extract-settings').prop('disabled', true);
		}
		else
			$('.text-extract-settings').prop('disabled', false);
		$('select').material_select();
	});

	// Add a disclaimer cookie upon closing
	$('#disclaimer-close').on('click', function() {
		sessionStorage.setItem('disclaimer-seen', true);
	});

	// Show disclaimer if it has not been seen yet
	if (!sessionStorage.getItem('disclaimer-seen')) $('#disclaimer').modal('open');

});

// Make an AJAX request
function ajax(url, data, successFunc, errorFunc) {
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		processData: false,
		contentType: 'application/json',
		success: successFunc,
		error: errorFunc,
		timeout: 180000
	});
}

// Show ID Image preview
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		if ($(input).attr('id') == 'id-photo-extract') {
			reader.onload = function (e) {
				$('#id-preview-extract').attr('src', e.target.result);
				$('#id-photo-extract-file-path-error').remove();
			};
		} else if ($(input).attr('id') == 'id-photo-verify') {
			reader.onload = function (e) {
				$('#id-preview-verify').attr('src', e.target.result);
				$('#id-photo-verify-file-path-error').remove();
			};
		} else {
			reader.onload = function (e) {
				var preview = $('<img>', {
					'class': 'photo-preview-tooltip',
					'src': e.target.result
				});
				$('.photo-preview').tooltip('remove');
				$('.photo-preview').tooltip({
					delay: 50,
					position: 'top',
					html: true,
					tooltip: preview.prop('outerHTML')
				});
				$('#profile-photo-file-path-error').remove();
			}
		}
		reader.readAsDataURL(input.files[0]);
	}
}

// Populate slides for pipeline carousel
function populatePipeline(pipelineType, numImages) {
	var attachTo = pipelineType == PipelineType.TEXT ? $('#text-pipe') : $('#profile-pipe');
	var imagePrepend = pipelineType == PipelineType.TEXT ? '' : 'f';
	// Clear existing pipeline slides
	attachTo.slick('removeSlide', null, null, true);
	for (var i = 1; i <= numImages; i++) {
		// Get file path
		var imagePath = PATH_TO_PIPELINE + imagePrepend + i + '.png';
		// Determine if image exists
		imageExists(imagePath, false, function (image) {
			var nonCachedImage = image + '?t=' + new Date().getTime();
			// Create anchor
			var anchor = $('<a>', {
				'href': nonCachedImage,
				'data-lightbox': isTextPipeline ? 'text-pipelet' : 'profile-pipelet'
			});
			// Attach to the anchor
			$('<div>', {
				'class': 'pipe-slide',
				'style': 'background-image: url(' + nonCachedImage + ');'
			}).appendTo(anchor);
			// Finally, add the anchor as a slide to slick carousel
			attachTo.slick('slickAdd', anchor)
		});
	}
}

// Check if a given file exists
function imageExists(image, remote, callback) {
	if (!remote) {
		var img = new Image();
		img.src = image;
		img.onload = function () {
			// Image exists, therefore, proceed
			callback(image);
		}
	} else {
		var url = SERVER_BASE_URL + image;
		$.ajax({
			url: '',
			type: 'HEAD',
			success: function () {
				// Image exists, therefore, proceed
				callback(file);
			}
		});
	}
}

// Clears ID previews
function clearIDPreviews() {
	$('#id-preview-extract').attr('src', 'img/id-card.png');
	$('#id-preview-verify').attr('src', 'img/id-card.png');
	$('#id-photo-extract').val('');
	$('#id-photo-verify').val('');
	$('.file-path-wrapper input').val('');
	$('#profile-photo').val('');
	$('.photo-preview').tooltip('remove');
	$('label[id$=-error]').remove();
	$('.invalid').removeClass('invalid');
}

// Clears extract fields
function clearExtractFields() {
	// Clear text
	$('input[id$=extract]').each(function () {
		var id = $(this).attr('id').replace('-extract', '');
		if (id != 'id-photo') {
			$(this).val('');
			$(this).blur();
		}
	});
	// Clear the face image
	document.getElementById("face-preview-extract").src = 'img/profile.png';
}

// Clears verification fields
function clearVerificationFields() {
	// Clear text
	$('input[id$=verify]').each(function () {
		var id = $(this).attr('id').replace('-verify', '');
		if (id != 'id-photo') {
			$(this).val('');
			$(this).blur();
		}
	});
}

function addPreferences(formData) {
	var blurTechnique = $('#blur_technique').val();
	var thresholdTechnique = $('#threshold_technique').val();
	var profileSwitch = $('#profile_switch').is(':checked');
	var barcodeSwitch = $('#barcode_switch').is(':checked');
	var extractRed = $('#extract_red').is(':checked');
	var extractGreen = $('#extract_green').is(':checked');
	var extractBlue = $('#extract_blue').is(':checked');

	// Add id type to preferences if selected
	var idType = $('#id-type').val();
	if(idType != 'default')
		formData['id_type'] = idType;

	// Send preferences if auto settings is off
	if (!$('#auto_settings').is(':checked')) {
		formData['blur_technique'] = blurTechnique;
		formData['threshold_technique'] = thresholdTechnique;
		formData['remove_face'] = profileSwitch;
		formData['remove_barcode'] = barcodeSwitch;

		if (extractBlue)
			formData['color'] = "blue";
		else if (extractGreen)
			formData['color'] = "green";
		else if (extractRed)
			formData['color'] = "red";
	}

	// Verbose output for verification
	var verboseVerify = $('#verbose_switch').is(':checked');
	formData['verbose_verify'] = verboseVerify;

	// Verification threshold
	var verificationThreshold = parseFloat($('#verification-threshold')).toFixed(2);
	formData['verification_threshold'] = verificationThreshold;
}

function populateDetailedResults(data) {
	// Clear any previous data
	$('#text-verify-details, #verify-details').html('');

	// Populate the verify table
	var percent = parseFloat(data.face_match).toFixed(2);
	var row = $('<tr>');
	row.append('<td>Profile</td>');
	row.append('<td class="center-align">' + (!isNaN(percent) ? percent + '%' : '-')  + '</td>');
	row.append('<td class="center-align">-</td>');
	row.append('<td class="center-align">-</td>');
	$('#verify-details').append(row);
	percent = parseFloat(data.text_match.total).toFixed(2);
	row = $('<tr>');
	row.append('<td>Text</td>');
	row.append('<td class="center-align">' + (!isNaN(percent) ? percent + '%' : '-') + '</td>');
	row.append('<td class="center-align">-</td>');
	row.append('<td class="center-align">-</td>');
	$('#verify-details').append(row);
	var threshold = parseFloat($('#verification-threshold').val()).toFixed(2);
	var passResult = data.total_match >= threshold ? 'Pass' : 'Fail';
	percent = parseFloat(data.total_match).toFixed(2);
	row = $('<tr>');
	row.append('<td>Total</td>');
	row.append('<td class="center-align">' + (!isNaN(percent) ? percent + '%' : '-') + '</td>');
	row.append('<td class="center-align">' + threshold + '%</td>');
	row.append('<td class="center-align">' + passResult + '</td>');
	$('#verify-details').append(row);
	
	// Populate the text verify table data with the textMatch data
	var textMatch = data.text_match;
	for (var field in textMatch) {
		if (field !== 'total') {
			var percent = parseFloat(textMatch[field].match_percentage).toFixed(2);
			eFieldVal = textMatch[field].extracted_field_value;
			vFieldVal = textMatch[field].verifier_field_value;
			var row = $('<tr>');
			row.append('<td>' + titleCase(field.replace(/_/g, ' ')) + '</td>');
			row.append('<td class="center-align">' + (vFieldVal == '' || vFieldVal == null ? '-' : vFieldVal) + '</td>');
			row.append('<td class="center-align">' + (eFieldVal == '' || eFieldVal == null ? '-' : eFieldVal) + '</td>');
			row.append('<td class="right-align">' + (!isNaN(percent) ? percent + '%' : '-&nbsp;&nbsp;&nbsp;&nbsp;') + '</td>');
			// Append the newly created row to the table
			$('#text-verify-details').append(row);
		}
	}
	
	// Append the total as a special row
	var row = $('<tr class="total-row">');
	row.append('<td></td>');
	row.append('<td></td>');
	row.append('<td></td>');
	row.append('<td class="right-align">' + parseFloat(textMatch.total).toFixed(2) + '%</td>');
	$('#text-verify-details').append(row);
}

function titleCase(str) {
    return str.split(' ').map(
        function (s) {
            return s[0].toUpperCase() + s.substring(1).toLowerCase()      
		}
	).join(' ');
}

function ellipses(selector) {
	// Timer for ellipses dots underneath waiting spinners
	$(selector).text('');
	return setInterval(function() {
		$(selector).text(function() {
			switch($(selector).text()){
				case '':
					return '.';
				case '.':
					return '..';
				case '..':
					return '...';
				default:
					return '';
			}
		});
	}, 800);
}

function populateCircleGraphs(data) {
	// Assign data attributes for future usage
	var totalMatch = parseFloat(data.total_match).toFixed(2);
	var profileMatch = parseFloat(data.face_match).toFixed(2);
	var textMatch = parseFloat(
		typeof data.text_match === 'object'? 
		data.text_match.total: data.text_match
	).toFixed(2);

	// Results circliful
	$('.result-total').circliful({
		percent: totalMatch,
		text: 'Total',
		textBelow: true,
		decimals: 2,
		alwaysDecimals: true,
		foregroundColor: '#80cbc4',
		backgroundColor: 'none',
		fillColor: '#eee',
		foregroundBorderWidth: 4,
		iconColor: '#80cbc4',
		icon: 'f2c3',
		iconSize: '30',
		iconPosition: 'middle'
	}, function() {
		// Manually re-assign percentages as there is a bug with
		// the circliful library
		setTimeout(function(){
			$('.result-total .number').text(totalMatch);
		}, 50);
	});

	$('.result-text').circliful({
		percent: textMatch,
		text: 'Text',
		textBelow: true,
		decimals: 2,
		alwaysDecimals: true,
		foregroundColor: '#80cbc4',
		backgroundColor: 'none',
		fillColor: '#eee',
		foregroundBorderWidth: 4,
		iconColor: '#80cbc4',
		icon: 'f022',
		iconSize: '30',
		iconPosition: 'middle'
	}, function() {
		// Manually re-assign percentages as there is a bug with
		// the circliful library
		setTimeout(function(){
			$('.result-text .number').text(textMatch);
		}, 50);
	});

	$('.result-profile').circliful({
		percent: profileMatch,
		text: 'Profile',
		textBelow: true,
		decimals: 2,
		alwaysDecimals: true,
		foregroundColor: '#80cbc4',
		backgroundColor: 'none',
		fillColor: '#eee',
		foregroundBorderWidth: 4,
		iconColor: '#80cbc4',
		icon: 'f007',
		iconSize: '30',
		iconPosition: 'middle'
	}, function() {
		// Manually re-assign percentages as there is a bug with
		// the circliful library
		setTimeout(function(){
			$('.result-profile .number').text(profileMatch);
		}, 50);
	});

	// Combined result - for smaller displays
	$(".result-total-sm").circliful({
		backgroundBorderWidth: 1,
		foregroundBorderWidth: 4,
		textStyle: 'font-size: 2px;',
		textColor: '#202020',
		multiPercentage: 1,
		percentages: [{
				'percent': textMatch, 
				'color': '#3180B8', 
				'title': 'Text'
			 }, {
				'percent': profileMatch, 
				'color': '#49EBA8', 
				'title': 'Profile' 
			}, {
				'percent': totalMatch, 
				'color': '#80cbc4', 
				'title': 'Total' 
		}],
		multiPercentageLegend: 1,
		replacePercentageByText: '',
		backgroundColor: 'none',
		icon: 'f2c3',
		iconPosition: 'middle',
		iconColor: '#666',
	});

	// Detailed results circle for depicting threshold
	var progressColor = {};
	var threshold = parseFloat($('#verification-threshold').val()).toFixed(2);
	progressColor[0] = '#E63B2E';
	progressColor[threshold] = '#90DD44';
	$('.result-detailed').circliful({
		percent: totalMatch,
		text: 'Total Match',
		textBelow: true,
		decimals: 2,
		alwaysDecimals: true,
		foregroundColor: '#80cbc4',
		backgroundColor: 'none',
		fillColor: '#eee',
		foregroundBorderWidth: 4,
		animateInView: true,
		progressColor: progressColor,
		icon: 'f2c3',
		iconPosition: 'middle',
		iconColor: '#666',
	}, function() {
		// Manually re-assign percentages as there is a bug with
		// the circliful library
		setTimeout(function(){
			$('.result-detailed .number').text(totalMatch);
		}, 50);
	});
}

// Peform checks and notifications regarding valid input for
// verification use case.
function verifyInputCheck() {
	$('#verify-form').validate({
		focusInvalid: false,
		focusCleanup: true,
		errorClass: 'invalid',
		submitHandler: function(form) {}, // Set empty handler otherwise form is submitted
		rules: {
			'id-photo-verify-file-path': {
				required: true
			},
			'profile-photo-file-path': {
				required: true
			}
		},
		messages: {
			'id-photo-verify-file-path': {
				required: '*Required'
			}, 
			'profile-photo-file-path': {
				required: '*Required'
			}
		}
	});
	return $('#id-photo-verify').val() != '' && $('#profile-photo').val() != '';
}

// Peform checks and notifications regarding valid input for
// extraction use cases.
function extractInputCheck() {
	$('#extract-form').validate({
		focusInvalid: false,
		focusCleanup: true,
		errorClass: 'invalid',
		submitHandler: function(form) {}, // Set empty handler otherwise form is submitted
		rules: {
			'id-photo-extract-file-path': {
				required: true
			}
		},
		messages: {
			'id-photo-extract-file-path': {
				required: '*Required'
			}
		}
	});
	return $('#id-photo-extract').val() != '';
}

// Disable all the hover effects.
function disableHoverEffects() {
	$('.tooltipped').tooltip('remove');
	$('.tooltipped').removeClass('tooltipped');
	$('.hoverable').removeClass('hoverable');
}
