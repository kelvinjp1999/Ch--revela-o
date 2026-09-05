import { BrowserRouter, Route, Routes } from 'react-router-dom'

import GiftsPage from '../pages/Gifts/GiftsPage'
import HomePage from '../pages/Home/HomePage'
import AdminPage from '../pages/Admin/AdminPage'
import ScrollToTop from './ScrollToTop'

function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<GiftsPage />} path="/gifts" />
        <Route element={<AdminPage />} path="/admin" />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
