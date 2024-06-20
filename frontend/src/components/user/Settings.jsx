import React, { useState } from 'react'
import useAuth from '../../hooks/useAuth';
import { Global } from '../../helpers/Global';
import defaultAvatar from '../../assets/img/user.png'
import { SerializeForm } from '../../helpers/SerializeForm';

export const Settings = () => {

    const { auth, setAuth } = useAuth();
    const [saved, setSaved] = useState("not_saved");
    const [responseMessage, setResponseMessage] = useState("");

    const updateUser = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        let newDataUser = SerializeForm(e.target);
        delete newDataUser.imgAvatar;

        const request = await fetch(Global.url + "/user/update", {
            method: "PUT",
            body: JSON.stringify(newDataUser),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();
        setResponseMessage(data.message);

        if (data.status == "success" && data.user) {
            delete data.user.password;
            setAuth(data.user);
            setSaved("saved");
        } else {
            setSaved("error");
        }

        // File upload
        const fileInput = document.querySelector("#file");

        if (data.status == "success" && fileInput.files[0]) {
            const formData = new FormData();
            formData.append("imgAvatar", fileInput.files[0]);

            const uploadRequest = await fetch(Global.url + "/user/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": token
                }
            });

            const uploadData = await uploadRequest.json();

            if (uploadData.status == "success" && data.user) {
                delete uploadData.user.password;
                localStorage.setItem("token", uploadData.newToken);
                setAuth(uploadData.user);
                setSaved("saved");
            } else {
                setSaved("error");
            }
        }
    }

    return (
        <>
            <header className="content__header content__header--public">
                <h1 className="content__title">Ajustes</h1>
            </header>

            <div className="content__posts">

                {saved != "not_saved" ?
                    (<strong className={saved == "saved" ? 'alert alert-success' : 'alert alert-danger'}>{responseMessage}</strong>)
                    :
                    <strong></strong>
                }

                <form className="settings-form" onSubmit={updateUser}>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" defaultValue={auth.name} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="surname">Apellidos</label>
                        <input type="text" name="surname" defaultValue={auth.surname} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nick">Usuario</label>
                        <input type="text" name="nick" defaultValue={auth.nick} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" defaultValue={auth.email} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea name="bio" defaultValue={auth.bio} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imgAvatar">Avatar</label>
                        <div className="general-info__container-avatar">
                            {auth.avatar != "default.png" ?
                                <img src={Global.url + "/user/avatar/" + auth.avatar} className="container-avatar__img" alt="Foto de perfil" />
                                :
                                <img src={defaultAvatar} className="container-avatar__img" alt="Foto de perfil" />
                            }
                        </div>
                        <br />
                        <input type="file" name="imgAvatar" id="file" />
                    </div>
                    <br />
                    <input type="submit" value="Guardar" className="btn btn-success" />
                </form>

            </div>
        </>
    )
}