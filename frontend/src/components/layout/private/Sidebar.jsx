import React, { useState } from 'react'
import defaultAvatar from '../../../assets/img/user.png'
import useAuth from '../../../hooks/useAuth'
import { Global } from '../../../helpers/Global';
import { Link } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';

export const Sidebar = () => {

    const { auth, counters } = useAuth();
    const { form, changed } = useForm({});
    const [stored, setStored] = useState("not_stored");
    const [responseMessage, setResponseMessage] = useState("");


    const savePost = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        let newPost = form;
        newPost.user = auth._id;

        const request = await fetch(Global.url + "/post/save", {
            method: "POST",
            body: JSON.stringify(newPost),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();
        setResponseMessage(data.message);

        if (data.status == "success") {
            setStored("stored");
        } else {
            setStored("error");
        }

        const fileInput = document.querySelector("#file-post");

        if (data.status == "success" && fileInput.files[0]) {
            const formData = new FormData();
            formData.append("imgPost", fileInput.files[0]);

            const uploadRequest = await fetch(Global.url + "/post/upload/" + data.post._id, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": token
                }
            });

            const uploadData = await uploadRequest.json();

            if (uploadData.status == "success") {
                setStored("stored");
            } else {
                setStored("error");
            }
        }

        const formPost = document.querySelector("#form-post");
        formPost.reset();
    }

    return (
        <aside className="layout__aside">

            <header className="aside__header">
                <h1 className="aside__title">Hola, {auth.name}</h1>
            </header>

            <div className="aside__container">

                <div className="aside__profile-info">

                    <div className="profile-info__general-info">
                        <div className="general-info__container-avatar">
                            {auth.avatar != "default.png" ?
                                <img src={Global.url + "/user/avatar/" + auth.avatar} className="container-avatar__img" alt="Foto de perfil" />
                                :
                                <img src={defaultAvatar} className="container-avatar__img" alt="Foto de perfil" />
                            }
                        </div>

                        <div className="general-info__container-names">
                            <Link to={"/social/perfil/" + auth._id} className="container-names__name">{auth.name} {auth.surname}</Link>
                            <p className="container-names__nickname">{auth.nick}</p>
                        </div>
                    </div>

                    <div className="profile-info__stats">

                        <div className="stats__following">
                            <Link to={"/social/siguiendo/" + auth._id} className="following__link">
                                <span className="following__title">Siguiendo</span>
                                <span className="following__number">{counters.following}</span>
                            </Link>
                        </div>
                        <div className="stats__following">
                            <Link to={"/social/seguidores/" + auth._id} className="following__link">
                                <span className="following__title">Seguidores</span>
                                <span className="following__number">{counters.followers}</span>
                            </Link>
                        </div>


                        <div className="stats__following">
                            <Link to={"/social/perfil/" + auth._id} className="following__link">
                                <span className="following__title">Publicaciones</span>
                                <span className="following__number">{counters.posts}</span>
                            </Link>
                        </div>


                    </div>
                </div>


                <div className="aside__container-form">

                    {stored != "not_stored" ?
                        (<strong className={stored == "stored" ? 'alert post alert-success' : 'alert post alert-danger'}>{responseMessage}</strong>)
                        :
                        <strong></strong>
                    }

                    <form id="form-post" className="container-form__form-post" onSubmit={savePost}>

                        <div className="form-post__inputs">
                            <label htmlFor="text" className="form-post__label">¿Que estas pensando hoy?</label>
                            <textarea name="text" className="form-post__textarea" onChange={changed} />
                        </div>

                        <div className="form-post__inputs">
                            <label htmlFor="file" className="form-post__label">Sube tu foto</label>
                            <input type="file" name="imgPost" id="file-post" className="form-post__image" />
                        </div>

                        <input type="submit" value="Enviar" className="form-post__btn-submit btn-primary" />

                    </form>

                </div>

            </div>

        </aside>
    )
}