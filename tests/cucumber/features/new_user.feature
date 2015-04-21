Feature: Hitting the home page

  As a [role]
  I want [feature]
  So that [benefit]

  The story above is to set context for the reader. It doesn't actually have any impact on the test
  itself. The phrases inside the scenarios are ties to test code using regex, which you can see in
  /tests/features/step_definitions/steps.js

  Scenario:
    Given I am a new user
    When I navigate to "/"
    Then I should see the title "MVP"

Feature: Signing up a new user

  As a new user
  I want to create an account
  so I can connect my account to Twitter

  Scenario:
    Given I am a new user
    When I navigate to "/signup"
    And I provide a username and password
    Then I should be logged in
    And I should be asked to connect to Twitter
