import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Header() {

  return (
    <header className="bg-white z-50 relative">
      <nav
        aria-label="Global"
        className="flex items-center justify-between mx-auto "
      >
        <div className="flex lg:flex-1">
          <Link to={"/"} className="-m-1.5 p-1.5">
            <span className="sr-only">Главная</span>
            <img
              alt=""
              style={{borderRadius: '20%'}}
              src="/loho.jpg"
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to={"/docs"} className="text-sm/6 font-semibold text-gray-900">
            Реализация
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="https://t.me/O101O1O1O"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Телеграм <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
    </header>
  );
}