import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { Global } from '../../helpers/Global'

export const Register = () => {

    const { form, changed } = useForm({});
    const [saved, setSaved] = useState("not_sended");
    const [responseMessage, setResponseMessage] = useState("");

    const saveUser = async (e) => {
        e.preventDefault();

        let newUser = form;

        const request = await fetch(Global.url + "/user/register", {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();
        setResponseMessage(data.message);

        if (data.status == "success") {
            setSaved("saved");
        } else {
            setSaved("error");
        }
    }

    return (
        <>
            <header className="content__header content__header--public">
                <h1 className="content__title">Registro</h1>
            </header>

            <div className="content__posts">

                {saved != "not_sended" ?
                    (<strong className={saved == "saved" ? 'alert alert-success' : 'alert alert-danger'}>{responseMessage}</strong>)
                    :
                    <strong></strong>
                }

                <form className="register-form" onSubmit={saveUser}>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="surname">Apellidos</label>
                        <input type="text" name="surname" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nick">Usuario</label>
                        <input type="text" name="nick" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" onChange={changed} />
                    </div>

                    <input type="submit" value="Registrarse" className="btn btn-primary" />
                </form>

            </div>
        </>
    )
}