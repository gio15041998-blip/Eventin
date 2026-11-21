import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
function App(){return <main><a className="brand" href="/">eventin<span>·</span></a><h1>Todo empieza con una buena idea.</h1><p>Organiza una celebración con tus personas favoritas o descubre tu próximo plan.</p><p className="notice">Proyecto inicializado. La aplicación completa se construirá siguiendo el diseño y el contrato de navegación incluidos.</p><a className="button" href="https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=87-1564">Ver el flujo de Eventin</a></main>};createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
