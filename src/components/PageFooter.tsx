export default function PageFooter() {
  return (
    <footer className="page-footer">
      <span className="page-footer-copy">© {new Date().getFullYear()} PixelShift</span>
      <nav className="page-footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">API</a>
      </nav>
    </footer>
  )
}
