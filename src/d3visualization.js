import { useRef, useEffect} from 'react';
import { select, hierarchy, tree, linkVertical, schemeBrBG} from 'd3';
import useResizeObserver from './useResizeObserver';
import {convertData, buildTrie, buildDictionaryLinks, buildFailureEdges} from './ahoAutomaton';
import './App.css'

const TrieVisual = ({substrings, mainstring}) => {
    var nodeStrings = {};
    var wordFound = {};
    
    var trie = buildTrie(substrings, wordFound, nodeStrings);
    var trieData = convertData(trie, 0, nodeStrings); //wordfound  //nodeStrings)
    var failureLinks = buildFailureEdges(nodeStrings);
    var dictLinks = buildDictionaryLinks(trie, failureLinks, wordFound);


    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    function findPosition(rootDescendants, name, rootPos, offset) {
        let shift = 0;
        if (offset) shift = 12;
        if (name === "Root") {
            return [rootPos]
        }
        for (let i = 1; i < rootDescendants.length; i++) {
            if (rootDescendants[i].data.name === name) {
                return [rootDescendants[i].x + shift, rootDescendants[i].y + shift];
            }
        }
    }


    function convertFailLinks(rootDescendants, failLinks, nodeStrings, root) {
        let convertedLinks = [];
        let interimObj = {};
        for (let i = 0; i < Object.keys(failLinks).length; i++) {
            interimObj={}
            interimObj.source = findPosition(rootDescendants, nodeStrings[i], [root.x, root.y], false);
            interimObj.target = findPosition(rootDescendants, nodeStrings[failLinks[i]], [root.x+15, root.y+15], false);
            convertedLinks.push(interimObj);
        }
        return convertedLinks;
    }

    function convertDictLinks(rootDescendants, dictLinks, nodeStrings, root) {
        let convertedLinks = [];
        let interimObj = {};
        for (let link in dictLinks) {
            interimObj={}
            interimObj.source = findPosition(rootDescendants, nodeStrings[link], [root.x, root.y], true);
            interimObj.target = findPosition(rootDescendants, nodeStrings[dictLinks[link]], [root.x, root.y], true);
            convertedLinks.push(interimObj);
        }
        return convertedLinks;
    }

    useEffect(() => {
        const svg = select(svgRef.current);
        if (!dimensions) return;
        const root = hierarchy(trieData);
        const treeLayout = tree().size([dimensions.width/1.3, dimensions.height*4]);
        treeLayout(root);

        console.log(findPosition(root.descendants(), "hers"))
        let failLinksd3 = convertFailLinks(root.descendants(), failureLinks, nodeStrings, root);
        let dictLinksd3 = convertDictLinks(root.descendants(), dictLinks, nodeStrings, root);

        console.log(dictLinks)
        console.log(nodeStrings[7] + " " + nodeStrings[2])
        console.log(dictLinksd3)
        console.log(failLinksd3);
        console.log(root)

        // svg.append("svg:defs").selectAll("marker")
        //     .data(["mid"])      // Different link/path types can be defined here
        //     .enter().append("svg:marker")    // This section adds in the arrows
        //     .attr("id", String)
        //     .attr("viewBox", "0 -5 10 10")
        //     .attr("refX", 1.5)
        //     .attr("refY", 0.5)
        //     .attr("markerWidth", 40)
        //     .attr("markerHeight", 40)
        //     .attr("orient", "auto")
        //     .append("svg:path")
        //     .attr("d", "M0,-5L10,0L0,5");


        const createLink = linkVertical().x(node => node.x).y(node => node.y);
        var linkGen = linkVertical();
        var dictLinkGen = linkVertical();
 

        svg
            .selectAll(".link")
            .data(root.links())
            .join("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", createLink);


            
        svg
            .selectAll(".path")
            .data(failLinksd3)
            .join("path")
            .attr("class", "path")
            .attr("d", linkGen)
            .attr("fill", "none")
            .attr("stroke", "red");
            // .attr("marker-mid", "url(#mid)");

        svg
            .selectAll(".dict")
            .data(dictLinksd3)
            .join("path")
            .attr("class", "dict")
            .attr("d", dictLinkGen)
            .attr("fill", "none")
            .attr("stroke", "blue");
            // .attr("marker-mid", "url(#mid)");



        svg
            .selectAll(".node")
            .data(root.descendants())
            .join("circle")
            .attr("class", "node")
            .attr("r", 38)
            .attr("fill", "#7077fa")
            .attr("cx", node => node.x)
            .attr("cy", node => node.y);

    

        svg
            .selectAll(".label")
            .data(root.descendants())
            .join("text")
            .attr("class", "label")
            .text(node => node.data.name)
            .attr("text-anchor", "middle")
            .attr("font-size", 26)
            .attr("x", node => node.x)
            .attr("y", node=> node.y);


 
    }, [trieData, dimensions, substrings]);

    function visualize() {
    
    }

    return(
        <div>
            <button className="visualizeButton" onClick={visualize}>Search and Visualize!</button>
            <h1 className='legend'>Red Links denote Failure Links <br/>Blue Links denote Dictionary Links<br/> Nodes with no failure link link back to root node</h1>
            <div ref = {wrapperRef} style={{marginTop: "2rem", overflow:"visible"}} className="svgDiv" >
                <svg ref={svgRef}>
                </svg>
            </div>
        </div>
    );
}

export default TrieVisual;

