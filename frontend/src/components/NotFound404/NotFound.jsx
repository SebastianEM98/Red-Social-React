import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound = () => {
    return (
        <>
            <p>
                <h1>Error 404</h1>
                <p>El sitio al que intenta acceder no existe</p>
                <Link to='/'>Volver al inicio</Link>
            </p>
        </>
    )
}