Template.newDashboard.onRendered(function() {
  $('#newDashboard').validate({
    rules: {
      keyword1: {
        required: true,
        minlength: 2,
        maxlength: 15
      },
      keyword2: {
        required: false,
        minlength: 2,
        maxlength: 15
      },
      keyword3: {
        required: false,
        minlength: 2,
        maxlength: 15
      }
    },
    messages: {
      keyword1: {
        required: "Please enter at least one keywords",
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
      keyword2: {
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
      keyword3: {
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
    },
    submitHandler: function() {
      var keywords = [$('[name="keyword1"]').val(), $('[name="keyword2"]').val(), $('[name="keyword3"]').val()];
      // strip out empty strings if necessary
      keywords = _.compact(keywords);
      Meteor.call("newDashboard", keywords, function(error, _id) {
        if (error) {
          Bert.alert("Something went wrong:" + error.reason, 'danger');
        }
        if (_id) {
          Bert.alert("Dashboard saved successfully", 'success');
          Router.go('dashboard.show',{_id: _id});
        }
      });
    }
  });
});
