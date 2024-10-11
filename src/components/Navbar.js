import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar navbar-dark bg-primary shadow">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1 ml-5"><i className="bi bi-whatsapp"></i> WhatsTap
        </span>
        <span>
          <a className="btn btn-outline-light mr-5" target="_blank" rel="noreferrer" href="https://github.com/dahiyamonu/WhatsTap">Code</a>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
