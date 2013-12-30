smarttv-twitch
==============
This is a simple app to watch Twitch.tv streams on Samsung Smart TV's. It has a very simple UI but works fine for me.
Only tested on Samsung UE40F6400 so no guarantees.

Stream lists filtered by game incoming.

Installation
==============
To install the app you need to install any http server and put TwitchTV_X.XX_America_XXXXXXXX.zip and widgetlist.xml to a directory which is configured as its root.

For example you can follow http://www.ricocheting.com/how-to-install-on-windows/apache manual and then put the files into DocumentRoot as it's called in the manual. You can check if you configured server correctly by typing http://127.0.0.1/widgetlist.xml in your browser - if everything is OK browser should start downloading this file from your local machine or just display its contents.

Now that server is running correctly make sure your TV and your computer are in the same local network and remember your computer LOCAL IP.

IMPORTANT: You need to edit widgetlist.xml. Change this string <download>http://192.168.1.150/TwitchTV_X.XX_America_XXXXXXXX.zip</download>
so your computer IP replaces '192.168.1.150'

Now, on your TV, go to Menu->Smart Features->Samsung Account and type name "develop". 

Then go to SmartHUB, click "More Apps" button, then click "Options" button and choose "IP Setting", enter your computer IP and then choose "Start App Sync" option. TwitchTV app has to be installed now.

For models released before 2013 you might want to use these instructions instead:
From the SmartHUB main screen, click the "Tools" button on the remote. Only from the "Tools" menu, navigate to "Settings", and from there to "Development". (You need to be logged in as 'develop')
