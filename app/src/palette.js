(function(){
  const inks=[{name:'Warm ivory',hex:'#fff4dc'},{name:'Sunshine',hex:'#ffcf61'},{name:'Coral',hex:'#ff6e91'},{name:'Seafoam',hex:'#8bf0e2'}];
  const grades=[
    {id:'vice',name:'Vice Sunset',note:'PINK / AMBER',overlay:'rgba(255,76,129,.18)',screen:'rgba(255,164,70,.12)',contrast:1.04,saturation:1.22},
    {id:'neon',name:'Neon Night',note:'CYAN / VIOLET',overlay:'rgba(24,32,100,.24)',screen:'rgba(0,238,220,.15)',contrast:1.18,saturation:1.32},
    {id:'golden',name:'Golden Hour',note:'HONEY / HEAT',overlay:'rgba(237,157,54,.23)',screen:'rgba(255,220,134,.16)',contrast:1.08,saturation:1.13}
  ];
  window.CoverPalette={inks,grades};
})();
