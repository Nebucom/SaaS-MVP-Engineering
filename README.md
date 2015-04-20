# SaaS-MVP-Engineering

Welcome in this online course on SaaS MVP Engineering.


In the previous assignments, we built our MVP. Now it is time to put it online and let the world see your brilliant piece of work.

Like with the software itself, we're going to take an minimalistic approach here, leveraging as much as possible existing things. Therefor, we will deploy our MVP on a PaaS, platform as a service. As it happens, the company behind Meteor is offering such a PaaS.

The benefits of such a PaaS are trivial for us: no need to worry about installing and operating mongo, nodejs and stuff. All that is taken care of by the PaaS provider.

So without further ado, let's deploy.

## Assignment 4: deployment
Before we can actually deploy, we need to head over to Twitter again and get ourselves a fresh set of application keys. We will not deploy our application in production using the same keys as for development.

Once that is done, we are ready to deploy.

In your terminal, simply do:
```
meteor deploy my-super-cool-mvp.meteor.com --settings settings-production.json
```

Hold your breath for a while and ta-da, your app online!!
