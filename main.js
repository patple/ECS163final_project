import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import StreamGraph from "./apps/streamgraph.js"
import BarGraph from "./apps/bargraph.js"
import Button from "./apps/slideButton.js"

let width = window.innerWidth;
let height = window.innerHeight;



d3.csv("./data/vgsales.csv").then(data => {
    let a = new Slide(width, height);
    let b = new Slide(width, height);
    let c = new Slide(width, height);
    let d = new Slide(width, height);
    let e = new Slide(width, height);
    

    let streamgraph = new StreamGraph(b.base)
    //console.log(Object.keys({width: 500, height: 500}))
    streamgraph.resizeStream({width: 1200, height: 500})
    streamgraph.moveStream({x: 20, y: 200})
    streamgraph.defineStreamMargins({top: 50, left: 100, bottom: 50, right: 50})

    streamgraph.initDataset(data);
    //console.log(streamgraph.dataset)
    streamgraph.calculateRegion("NA");
    streamgraph.drawRegion("NA");

    
    let genreGraph = new StreamGraph(c.base)
    genreGraph.resizeStream({width: 1200, height: 500})
    genreGraph.moveStream({x: 20, y: 200})
    genreGraph.defineStreamMargins({top: 50, left: 100, bottom: 50, right: 50})
    genreGraph.initDataset(data);
    genreGraph.calculateGenre("JP");
    genreGraph.drawGenre("JP");


    let searchGraph = new BarGraph(e.base)
    searchGraph.resizeBar({width: 1200, height: 500})
    searchGraph.moveBar({x: 20, y: 200})
    searchGraph.defineBarMargins({top: 50, left: 100, bottom: 50, right: 50})
    // this will be here untill the search is done 

    const searchInput = document.getElementById("game-search-input")
    const searchButton = document.getElementById("game-search-button")
    const searchError = document.getElementById("search-error")
    const autoList = document.getElementById("auto-fill")

    function clearAutoList(){
        autoList.innerHTML = ""
    }

    function searchGame(gameName){
        const matchedGames = data.filter(d=> d.Name.toLowerCase().includes(gameName.toLowerCase()))

        if(matchedGames.length === 1){
            searchError.style.display = "none"
            searchGraph.drawSearchGame(matchedGames[0])
        } else if (matchedGames.length > 1){
            searchError.style.display = "none"
            searchGraph.drawSearchGame(matchedGames[0])
            clearAutoList()

        }else{
            searchError.style.display= "block"
            clearAutoList()
        }
    }


    //function that creates the auto fill list
    function autoFill(input){
        clearAutoList()

        if(!input) return;
        const autoMatch = data.filter(d=> d.Name.toLowerCase().startsWith(input.toLowerCase()))

        if (autoMatch.length === 0){
            searchError.style.display= "block"
            return 
        } else{
            searchError.style.display= "none"
        }

        autoMatch.slice(0,10).forEach(match =>{
            const item = document.createElement("div")
            item.classList.add("auto-item")
            item.textContent = match.Name
            
            item.addEventListener("click", ()=>{
                searchInput.value = match.Name
                searchGame(match.Name)
                clearAutoList()
            })
            autoList.append(item)
        })
    }

    searchButton.addEventListener('click',()=>{
        const gameName = searchInput.value.trim();
        if(gameName.length > 0){
            searchGame(gameName)
        }
    })

    // went the Enter key is pressed searc hthe game
    searchInput.addEventListener('keydown',(event)=>{
        if(event.key === 'Enter'){
            const gameName = event.target.value.trim()
            autoFill(gameName)
            if(gameName.length > 0){
                searchGame(gameName)
                clearAutoList()
            }
        }
    
    
    })

    //displays the autofill list when a game is searched
     searchInput.addEventListener('input',(event)=>{
        const inputGame = event.target.value.trim()
        autoFill(inputGame)
    })


    let slides = new Slider([a, b, c, d, e], 200, [-width, 0, width])

    let prevButton = new Button(d3.select("svg"))
    prevButton.hide()
    
    prevButton.defineRectangle({width: width / 8, height: height / 8}, "steelblue", {width: 3, color: "midnightblue"}, "midnightblue");
    prevButton.drawRectangle();
    prevButton.assignFunction(function(){
        slides.goPrev(); 
    })
    prevButton.base.on("update", function(){
        slides.getIndex() == 0 ? prevButton.hide() : prevButton.show();
    })
    prevButton.defineText("white", 36, "black", 0);
    prevButton.drawText("BACK");

    let nextButton = new Button(d3.select("svg"))
    nextButton.move(0, height / 5)
    nextButton.defineRectangle({width: width / 8, height: height / 8}, "steelblue", {width: 3, color: "midnightblue"}, "midnightblue");
    nextButton.drawRectangle();
    nextButton.assignFunction(function(){
        slides.goNext(); 
    })
    nextButton.base.on("update", function(){
        slides.getIndex() >= slides.getLength() - 1 ? nextButton.hide() : nextButton.show();
    })
    nextButton.defineText("white", 36, "black", 0);
    nextButton.drawText("NEXT");


    // Controls the display of all overlays
    function updateOverlays(currentIndex) {
        document.querySelectorAll('.slide-overlay').forEach(overlay => {
            overlay.style.display = parseInt(overlay.dataset.slideIndex) === currentIndex 
                ? 'block' 
                : 'none';
        });
    }

    // ADD Slide switch
    slides.onSlideChange = (currentIndex) => {
        updateOverlays(currentIndex);
    };

    // int display
    updateOverlays(slides.currentIndex);

    const insights = document.querySelectorAll(".insights")
    function displayInsight(region){
        insights.forEach(insight=>{
            insight.style.display = insight.dataset.region === region ? "block" : "none"
        })
    }

    // each button action
    const regionChange = document.querySelectorAll('#region-buttons button')
    regionChange.forEach(button =>{
        button.addEventListener('click', ()=>{
            const region = button.dataset.region
            
            streamgraph.transitionTo(region, 'publisher')
            genreGraph.transitionTo(region, 'genre')

           displayInsight(region)

        })
        
    })
})






