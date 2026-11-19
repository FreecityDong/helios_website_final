import {createServer} from 'vite';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {mkdir,writeFile} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const m=await server.ssrLoadModule('/src/editorial.jsx');
 const pages=[['Home',m.NewHome,{reduce:true}],['Product',m.NewProduct,{}],['Why Helios',m.WhyHelios,{}],['Guides & Support',m.Guides,{}],['Getting started',m.Guides,{slug:'getting-started'}],['Voice commands',m.Guides,{slug:'voice'}],['Troubleshooting',m.Guides,{slug:'troubleshooting'}],['Our Team',m.NewTeam,{}],['Try Helios',m.Experience,{}],['Privacy & Data',m.Privacy,{}]];
 await mkdir('docs',{recursive:true});
 const output=pages.map(([page,Component,props])=>({page,html:renderToStaticMarkup(React.createElement(Component,props))}));
 await writeFile('docs/page-copy.json',JSON.stringify(output,null,2));
 console.log('Exported copy for '+output.length+' pages.');
} finally {await server.close();}
