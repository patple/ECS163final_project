# ECS163 Project Implementation #

This repo is the final project for ECS 162, which is an interactive slideshow that visualizes data about the top 2,0000 best selling games from 1980 to 2016.
The data was obtained from Kaggle and each game has their title, publisher, release date, genre, platform, and sales which were separated into regions. We utilize D3.js to create the visual graphs such as stream graphs and bar graphs. We also have a custom slide API that creates our slides and allows us to attach our visuals to them.
The main files that handle the implementations of the visualizations are streamgraph.js and bargraph.js which are located in the apps folder. Our styling of the slides were handled with HTML
CSS.

Uncut Data Set: https://www.kaggle.com/datasets/gregorut/videogamesales/data

[Video Install Demo](https://youtu.be/3z9Ro5VFom0)

How to run the slides 
1. First download code and extract from ZIP
2. Make sure you have the live server extension installed for VS code 
3. Right click on index.html in the main directory and click "Open with live server"
