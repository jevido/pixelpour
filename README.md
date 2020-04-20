<h1 align="center">PixelPour</h1>

<div align="center">
	
![Screenshot of PixelPour](https://raw.githubusercontent.com/jevido/pixelpour/master/screenshot.png)

</div>



## Features

- Create screenshots based on screens (windows & cropped images are in the future)
- Set custom shortcuts to anything on your keyboard or with keystrokes
- Upload Screenshots &amp; Files up to 10GB per file

## The heck is PixelDrain, and what the hell is PixelPour supposed to do
**What is PixelDrain?**

PixelDrain is a file sharing website built for speed and ease of use. It does not cost any money to use, although donations are appreciated. For donation methods see his [about page](https://pixeldrain.com/about).  
How the hell is this free? Well it runs on donations and a couple of ads, just check is about page man. He all explains it there, don't want to retype any more.  
But since people are lazy, basically nothing is done with your file, you get an url, with which you can visit it. If the file isn't viewed in 30 days, it will be deleted. If you accidentally uploaded something you shouldn't. Perhaps you should rethink your life choices, but also, don't share the link, it will eventually get deleted. And the files are never indexed or published anywhere, so nobody will find it in the great dark.


**So what is PixelPour?** 

PixelPour is a quickly made (not counting all the breaks i had in this project), screen &amp; file sharing platform. Completely depending on PixelDrain's great API and platform. Honestly i'm a big fan if you hadn't noticed.  
It's made with the "if it's dirty code, just take a shower afterwards" mentality. So don't mind sending a dirty pull request. Or make it cleaner for all i care.  
The idea behind this app was, i don't like having to open to many web based apps in my browser, like gMail and Jira, but i do want to quickly upload a file, or make a screenshot to send to coworkers or friends. Therefor i "hatsaflats'd" (not a clue what that is in english, i'm dutch) this project, and called it a day. Found out i kinda like working on this project, so now we're here.  
Why is it called "light" in the client, because i want to make a major version, with automatic updaters, and just keep it simple. Some day i want to create a "pro" version with more advanced options, like having an account, deleting files, having theme options. But that is still far from home.  
Also might be interesting to know, PixelPour never stores any kind of file on your copmuter, so even if it is bugged, there can never be any kind of file stored on your disk which would take unnecessary disk space. It's all uploaded or kept in a base64 string on the viewer.

## Get started

It's pretty easy to get started, so here's the bash

```bash
git clone https://github.com/jevido/pixelpour.git pixelpour
cd pixelpour
npm install
npm start

# For packaging there is
npm run package
```


## Future talk

So ehh, atm i don't have much time to work on this project, because either i'm tired or lazy. But there are still some things i want to get started with:
- Cropped images, pressing a keystroke, then selecting a square on your screen to make a cropped image
- Having the option to screenshot your current window, or a pre-selected window like "VS Code"
- Actual progressbars (DONE), and an option to re-upload in case something went wrong

## Works as designed

I don't really have the time to fix all the problems, but here is a list of bugs i'm aware of:
- Multiple monitor setup on linux, displays all screens into single "Entire screen" [bug report](https://bugs.chromium.org/p/chromium/issues/detail?id=396091)
- Not sure why, but after packaging you should copy-paste the assets folder inside the build dir

## Contributing

Any kind of help is welcome here, below are some examples which i appreciate:

- Use PixelDrain in your daily work. I don't care about PixelPour. Support him instead
- Submit [issues](http://github.com/jevido/pixelpour/issues) to report bugs or ask questions.
- Propose [pull requests](http://github.com/jevido/pixelpour/pulls) to improve my code, god knows it's awful
- Big thanks to [fengyuanchen](https://github.com/fengyuanchen) for creating the great cropper.js