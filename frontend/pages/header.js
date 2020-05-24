import React from "react";
import styled from "styled-components";

const BASE_URL = process.env.BASE_URL || "localhost:4000";

export default function Header() {
  return (
    <div class="wrapper-masthead">
      <div class="container">
        <header class="masthead clearfix">
          <a href={`${BASE_URL}/`} class="site-avatar">
            <img src="https://jeffchen.dev/images/profile.jpg" />
          </a>

          <div class="site-info">
            <h1 class="site-name">
              <a href={`${BASE_URL}/`}>Jeff Chen</a>
            </h1>
            <p class="site-description">Engineering & more</p>
          </div>

          <nav>
            <a href={`${BASE_URL}/about/`}>About</a>
            <a href={`${BASE_URL}/projects/`}>Projects</a>
            <a href={`${BASE_URL}/resume/`}>Résumé</a>
          </nav>
        </header>
      </div>
    </div>
  );
}
