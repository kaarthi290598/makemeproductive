"use client";

import React, { useState } from "react";

import Navbar from "./ui/navbar-menu";
import Hero from "./hero";

const LandingPage = () => {
  return (
    <section className="relative flex items-center justify-center h-screen  border border-gray-800 overflow-hidden">
      <Navbar className=" " />

      <Hero />
    </section>
  );
};

export default LandingPage;
