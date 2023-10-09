import { useRoutes } from "react-router-dom"
import {  Navigate } from "react-router-dom";



import Home from "views/home/index"


function Router() {
	const routes = useRoutes([
		{
			path: "/",
			element: <Navigate to="/home" />,
		},
		{
			path: "/home",
			element:  <Home />
		},
	])
	return routes
}

export default Router
