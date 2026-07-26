import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './showcase/Layout'
import { Landing } from './showcase/Landing'
import { ProjectPage } from './showcase/ProjectPage'
import { Poc } from './showcase/Poc'
import { DemoPage } from './showcase/DemoPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/poc" element={<Poc />} />
        </Route>
        <Route path="/demo/:id" element={<DemoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
