const DATA=[
  {year:"2021",score:3.819,rank:139,total:149},
  {year:"2022",score:3.777,rank:136,total:146},
  {year:"2023",score:4.036,rank:126,total:137},
  {year:"2024",score:4.054,rank:126,total:143},
  {year:"2025",score:4.389,rank:118,total:147},
  {year:"2026",score:4.536,rank:116,total:147}
];

const themeToggle=document.getElementById("themeToggle");
const savedTheme=localStorage.getItem("indextracker-theme");
if(savedTheme==="dark"){document.body.classList.add("dark");themeToggle.textContent="☀";}
themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  const dark=document.body.classList.contains("dark");
  localStorage.setItem("indextracker-theme",dark?"dark":"light");
  themeToggle.textContent=dark?"☀":"☾";
  if(window.indiaChart) window.indiaChart.update();
});

const ctx=document.getElementById("indiaChart");
window.indiaChart=new Chart(ctx,{
  type:"line",
  data:{
    labels:DATA.map(d=>d.year),
    datasets:[{
      data:DATA.map(d=>d.score),
      borderColor:"#d97927",
      backgroundColor:"rgba(217,121,39,.10)",
      borderWidth:3,
      pointRadius:DATA.map((_,i)=>i===DATA.length-1?7:4),
      pointHoverRadius:8,
      pointBackgroundColor:DATA.map((_,i)=>i===DATA.length-1?"#3d8b61":"#d97927"),
      pointBorderColor:DATA.map((_,i)=>i===DATA.length-1?"#fff":"#fff"),
      pointBorderWidth:2,
      tension:.35,
      fill:true
    }]
  },
  options:{
    responsive:true,
    maintainAspectRatio:false,
    interaction:{intersect:false,mode:"index"},
    plugins:{
      legend:{display:false},
      tooltip:{
        callbacks:{
          label:(ctx)=>` Score: ${ctx.parsed.y.toFixed(3)} / 10`
        }
      }
    },
    scales:{
      y:{
        min:0,max:10,
        ticks:{stepSize:2,color:"#8b877f"},
        grid:{color:"rgba(120,110,95,.13)"},
        border:{display:false},
        title:{display:true,text:"Life evaluation score",color:"#8b877f"}
      },
      x:{
        grid:{display:false},
        ticks:{color:"#8b877f"},
        border:{display:false}
      }
    }
  },
  plugins:[{
    id:"latestValue",
    afterDatasetsDraw(chart){
      const meta=chart.getDatasetMeta(0), i=meta.data.length-1, p=meta.data[i];
      if(!p)return;
      const {ctx}=chart;
      ctx.save();ctx.font="700 12px Inter, sans-serif";ctx.fillStyle="#3d8b61";ctx.textAlign="center";
      ctx.fillText(DATA[i].score.toFixed(3),p.x,p.y-16);ctx.restore();
    }
  }]
});
