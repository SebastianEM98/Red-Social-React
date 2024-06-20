import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';

export const Login = () => {

    const { form, changed } = useForm({});
    const [loginStatus, setLoginSatus] = useState("not_sended");
    const [responseMessage, setResponseMessage] = useState("");

    const { setAuth } = useAuth();

    const loginUser = async (e) => {
        e.preventDefault();

        let userToLogin = form;

        const request = await fetch(Global.url + "/user/login", {
            method: "POST",
            body: JSON.stringify(userToLogin),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();
        setResponseMessage(data.message);

        if (data.status == "success") {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setLoginSatus("logged_in");

            setAuth(data.user);

            setTimeout(() => {
                window.location.reload();
            }, 1200)

        } else {
            setLoginSatus("error");
        }
    }

    return (
        <>
            <header className="content__header content__header--public">
                <h1 className="content__title">Login</h1>
            </header>

            <div className="content__posts">

                {
                    loginStatus != "not_sended" ? (
                        <strong className={loginStatus == "logged_in" ? 'alert alert-success' : 'alert alert-danger'}>{responseMessage}</strong>
                    ) :
                        <strong></strong>
                }

                <form className='form-login' onSubmit={loginUser}>

                    <div className='form-group'>
                        <label htmlFor='email'>Correo electrónico</label>
                        <input type='email' name='email' onChange={changed} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='password'>Contraseña</label>
                        <input type='password' name='password' onChange={changed} />
                    </div>

                    <input type="submit" value='Ingresar' className='btn btn-primary' />
                </form>
            </div>
        </>
    )
}