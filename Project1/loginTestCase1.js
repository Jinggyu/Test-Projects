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
        await passwordInput.sendKeys('Password123');

       // Find the login button and click it
       const loginButton = await driver.findElement(By.css('button#submit.btn')); 
       await loginButton.click();

      // Verify new page URL contains practicetestautomation.com/logged-in-successfully/
       await driver.wait(until.urlContains('practicetestautomation.com/logged-in-successfully/'), 10000);
      
       console.log('Login successful!');
       console.log('Successful! The new page URL contains practicetestautomation.com/logged-in-successfully/')

       // Locate the success message element and get its text
       const successMessageElement = await driver.findElement(By.css('article'));
       const successMessageText = await successMessageElement.getText();

       // Verify that the text includes 'Congratulations' OR 'successfully logged in'
       if (successMessageText.includes('Congratulations') || successMessageText.includes('successfully logged in')) {
      console.log('Successful! The new page contains expected text.' );
      } else {
      console.error('Text verification failed. Neither of the expected phrases was found.');
      }
     
      // Verify that the button "Log out" is displayed on the new page
      const logoutButtonElement = await driver.findElement(By.css('a.wp-block-button__link.has-text-color.has-background.has-very-dark-gray-background-color')); 
      const isButtonDisplayed = await logoutButtonElement.isDisplayed();
      if (isButtonDisplayed) {
       console.log('Successful! The "Log out" button is displayed.');
      } else {
      console.error('Log out button verification failed. The "Log out" button is not displayed.');
      }

  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    await driver.quit();
  }
}
    

test()