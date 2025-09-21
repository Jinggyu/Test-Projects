const { WebDriver,until,Builder, By, Key } = require("selenium-webdriver");

require("chromedriver"); 
const assert = require('node:assert');

async function test(){
    try{
        var driver = new Builder()
    .forBrowser('chrome')
    .build();
        // Navigate to the website
        await driver.get('https://practicetestautomation.com/practice-test-login/')
        console.log(await driver.getTitle())

        // Find the username input field and enter the username
        const usernameInput = await driver.findElement(By.css('input#username'));
        await usernameInput.sendKeys('student');

        // Find the password input field and enter the password
        const passwordInput = await driver.findElement(By.css('input#password'));
        await passwordInput.sendKeys('incorrectPassword');

       // Find the login button and click it
       const loginButton = await driver.findElement(By.css('button#submit.btn')); 
       await loginButton.click();

      // Verify the error message is displayed
       const errorMessageElement = await driver.wait(until.elementLocated(By.css('div#error.show')), 10000);
       const isErrorDisplayed = await errorMessageElement.isDisplayed();

       if (isErrorDisplayed) {
      console.log('Verification 1 successful: Error message is displayed.');
    } else {
      console.error('Verification 1 failed: Error message is not displayed.');
      return; // Stop the test if the message isn't displayed
    }
     // Verify the error message text
      const errorMessageText = await errorMessageElement.getText();
      const expectedText = 'Your password is invalid!';

      if (errorMessageText.includes(expectedText)) {
      console.log('Verification 2 successful: Error message text is correct.');
    } else {
      console.error(`Verification 2 failed: Expected "${expectedText}", but found "${errorMessageText}".`);
    }

  } catch (error) {
    console.error('Test failed due to an exception:', error);
  } finally {
    // Close the browser
    await driver.quit();
  }
}

test()