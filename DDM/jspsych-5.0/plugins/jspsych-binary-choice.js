/**
 * jspsych-binary-choice
 * Mel W. Khaw
 *
 * plugin for displaying two choice stimuli and getting a keyboard response
 *
 *
 **/


jsPsych.plugins["binary-choice"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('binary-choice', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set default values for the parameters

    trial.left_key = trial.left_key || 81; // defaults to 'q'
    trial.right_key = trial.right_key || 80; // defaults to 'p'
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1;
    trial.timing_response = trial.timing_response || -1;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt = trial.prompt || "";

    // unpack the stimuli array
    trial.x_path = trial.stimuli[0];

    // if there is only a pair of stimuli, then the first is the target and is shown twice.
    // if there is a triplet, then the first is X, the second is the target, and the third is foil (useful for non-exact-match XAB).

    if (trial.stimuli.length == 2) {
      trial.a_path = trial.stimuli[0];
      trial.b_path = trial.stimuli[1];
    } else {
      trial.a_path = trial.stimuli[1];
      trial.b_path = trial.stimuli[2];
    }

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // randomize whether the target is on the left or the right
    var images = [trial.a_path, trial.b_path];
    var target_left = (Math.floor(Math.random() * 2) === 0); // 50% chance target is on left.
    if (!target_left) {
      images = [trial.b_path, trial.a_path];
    }

    // show the options
    if (!trial.is_html) {
      display_element.append($('<img>', {
        "src": images[0],
        "class": 'jspsych-bc-stimulus left'
      }));
      display_element.append($('<img>', {
        "src": images[1],
        "class": 'jspsych-bc-stimulus right'
      }));
    } else {
      display_element.append($('<div>', {
        "class": 'jspsych-bc-stimulus left',
        html: images[0]
      }));
      display_element.append($('<div>', {
        "class": 'jspsych-bc-stimulus right',
        html: images[1]
      }));
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // function to handle responses by the subject
    var after_response = function(info) {

      if (info.key  == trial.left_key) // 'q' key by default
      {
        info = info;

        }
     else if (info.key  == trial.right_key) // 'p' key by default
      {
        info = info;
        }

        end_trial(info);
     };

     var end_trial = function(info) {
       // kill any remaining setTimeout handlers
       for (var i = 0; i < setTimeoutHandlers.length; i++) {
         clearTimeout(setTimeoutHandlers[i]);
       }

       jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

       // create object to store data from trial
       var trial_data = {
         "rt": info.rt,
         "stimulus": JSON.stringify([trial.x_path, trial.a_path, trial.b_path]),
         "key_press": info.key,
         "reverse": !target_left
       };

       display_element.html(''); // remove all

       // move on to the next trial after timing_post_trial milliseconds
       jsPsych.finishTrial(trial_data);
     }

    // start the response listener

      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.left_key, trial.right_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });

  };

  return plugin;
})();
