import React from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '../components/layout/public/PublicLayout'
import { Login } from '../components/user/Login'
import { Register } from '../components/user/Register'
import { PrivateLayout } from '../components/layout/private/PrivateLayout'
import { Feed } from '../components/post/Feed'
import { NotFound } from '../components/NotFound404/NotFound'
import { AuthProvider } from '../context/AuthProvider'
import { Logout } from '../components/user/Logout'
import { People } from '../components/user/People'
import { Settings } from '../components/user/Settings'
import { Following } from '../components/follow/Following'
import { Followers } from '../components/follow/Followers'
import { Profile } from '../components/user/Profile'


export const Routing = () => {
    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>
                    <Route path='/' element={<PublicLayout />}>
                        <Route index element={<Login />} />
                        <Route path='login' element={<Login />} />
                        <Route path='registro' element={<Register />} />
                    </Route>

                    <Route path='/social' element={<PrivateLayout />}>
                        <Route index element={<Feed />} />
                        <Route path='logout' element={<Logout />} />
                        <Route path='publicaciones' element={<Feed />} />
                        <Route path='gente' element={<People />} />
                        <Route path='ajustes' element={<Settings />} />
                        <Route path='siguiendo/:userId' element={<Following />} />
                        <Route path='seguidores/:userId' element={<Followers />} />
                        <Route path='perfil/:userId' element={<Profile />} />
                    </Route>

                    <Route path='/404' element={<NotFound />} />
                    <Route path='*' element={<Navigate to='404' />} />
                </Routes>

            </AuthProvider>
        </BrowserRouter>
    )
}
