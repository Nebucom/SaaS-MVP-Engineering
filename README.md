# SaaS-MVP-Engineering

Up to now, we built our MVP, have a basic continuous delivery pipeline there, which allows us the push changes into production at the speed of light (almost). So let the users come in!!

Well, assuming you are doing ok with your marketing, you'll have some people trying out your new service. Congrats, cool!!

Big question off course: will these people stay with your service? And for your self, will you be able to handle all these users? Will you scale?

Let's start with this last question. Will you scale?

## Assignment 5
My 2 cents on this: if you are successful, regardless of your architecture and technology, you will face scaling issue. Things will brake. More important question is: did you see it coming? Do you know if something went bad?

Monitoring is the term used for all activities related to collecting metrics that might (or might not) indicate that your app, servers, databases, whatever are running fine.

For meteor, there is a service called [kadira](https://kadira.io) that you can use for monitoring your app.

Head over to https://kadira.io and create an account.

After creating your account, create an app in kadira, and follow the instructions you see. In our setup, we'll add the kadira keys via your settings files.

I advise to not include these keys in your development config file, only in your production one.

Redeploy your app and play around a bit, and see the kadira dashboard reflect changes. Under the alerts menu, you can define email alerts for when things go wrong: errors, slow methods, ...
