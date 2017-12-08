import React from 'react';
import {Link} from 'react-router-dom';

export default () => {
  return (
     <div className="boxed-view">
       <div className="boxed-view__box">
         <h1>Pagina nu exista</h1>
         <p>Ne pare rau, nu gasim pagina pe care ai cautat-o.</p>
         <Link to="/" className="button button--link">Intoarce-te la pagina principala</Link>
       </div>
     </div>
  );
};
