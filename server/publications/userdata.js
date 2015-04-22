Meteor.publish("userData", function() {
	if (this.userId) {
		return Meteor.users.find({
			_id: this.userId
		}, {
			fields: {
				'services.twitter.accessToken': 0,
				'services.twitter.accessTokenSecret': 0,
				'services.password': 0
			}
		});
	} else {
		this.ready();
	}
});
