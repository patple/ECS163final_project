import testmake from "./apps/test.js"
import Slider from "./apps/slideAPI.js"
import Slide from "./apps/slides/slideTemplate.js"
import StreamGraph from "./apps/streamgraph.js"
import testmakeSlide from "./apps/testmakeslide.js"
import BarGraph from "./apps/bargraph.js"

let width = window.innerWidth;
let height = window.innerHeight;



d3.csv("./data/vgsales.csv").then(data => {
    let a = testmakeSlide([width/2, 0, width/2, height/2, " rgb(202, 202, 202)"]);
    let b = new Slide(width, height)
    let c = testmakeSlide([width/2, 0, width/2, height/2, " rgb(202, 202, 202)"]);
    let d = testmakeSlide([width/2, height/2, width/2, height/2, " rgb(202, 202, 202)"]);


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


    let searchGraph = new BarGraph(d.base)
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
    //const placeHolderGame = data.find(d =>d.Name === "Wii Sports")
    //searchGraph.drawSearchGame(placeHolderGame)

    
   


    let slides = new Slider([a, b, c, d], 200, [-width, 0, width])
    d3.select("svg")
    .on("click", function() { slides.goNext(); })
    .on("contextmenu", function() { 
        d3.event.preventDefault(); 
        slides.goPrev(); 
    });

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






