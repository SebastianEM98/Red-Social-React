import React from 'react'
import { Header } from './Header'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import useAuth from '../../../hooks/useAuth'

export const PrivateLayout = () => {

    const { auth, loading } = useAuth();

    if (loading) {
        return <h1>Cargando...</h1>
    } else {
        return (
            <>
                {/* Header */}
                <Header />

                {/* Main Content */}
                <section className='layout__content'>
                    {/* <Outlet /> */}

                    {auth._id ?
                        <Outlet />
                        :
                        <Navigate to="/" />
                    }
                </section>

                {/* Sidebar */}
                <Sidebar />
            </>
        )
    }
}