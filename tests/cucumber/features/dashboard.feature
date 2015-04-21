Feature: Logged in users can create dashboard

  As a logged in user
  I want to navigate to the new dashboard page
  So that I can setup a new Twitter dashboard

Background:
    Given I am logged in

  Scenario:
    Given I am on home page
    When I click on the "New Dashboard" link
    Then I be able to setup a new Twitter dashboard
