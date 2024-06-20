import React from 'react'
import { NavLink } from 'react-router-dom'
import defaultAvatar from '../../../assets/img/user.png'
import useAuth from '../../../hooks/useAuth'
import { Global } from '../../../helpers/Global'

export const Nav = () => {

    const { auth } = useAuth();

    return (
        <nav className="navbar__container-lists">

            <ul className="container-lists__menu-list">
                <li className="menu-list__item">
                    <NavLink to="/social" className="menu-list__link">
                        <i className="fa-solid fa-house"></i>
                        <span className="menu-list__title">Inicio</span>
                    </NavLink>
                </li>

                <li className="menu-list__item">
                    <NavLink to="/social/publicaciones" className="menu-list__link">
                        <i className="fa-solid fa-list"></i>
                        <span className="menu-list__title">Feed</span>
                    </NavLink>
                </li>

                <li className="menu-list__item">
                    <NavLink to="/social/gente" className="menu-list__link">
                        <i className="fa-solid fa-user"></i>
                        <span className="menu-list__title">Gente</span>
                    </NavLink>
                </li>
            </ul>

            <ul className="container-lists__list-end">
                <li className="list-end__item">
                    <NavLink to={"/social/perfil/" + auth._id} className="list-end__link-image">
                        {auth.avatar != "default.png" ?
                            <img src={Global.url + "/user/avatar/" + auth.avatar} className="list-end__img" alt="Imagen de perfil" />
                            :
                            <img src={defaultAvatar} className="list-end__img" alt="Imagen de perfil" />
                        }
                    </NavLink>
                </li>
                <li className="list-end__item">
                    <NavLink to={"/social/perfil/" + auth._id} className="list-end__link">
                        <span className="list-end__name">{auth.nick}</span>
                    </NavLink>
                </li>

                <li className="list-end__item">
                    <NavLink to="/social/ajustes" className="list-end__link">
                        <i className="fa-solid fa-gear" />
                        <span className="list-end__name">Ajustes</span>
                    </NavLink>
                </li>

                <li className="list-end__item">
                    <NavLink to="/social/logout" className="list-end__link">
                        <i className="fa-solid fa-arrow-right-from-bracket" />
                        <span className="list-end__name">Cerrar sesión</span>
                    </NavLink>
                </li>
            </ul>

        </nav>
    )
}