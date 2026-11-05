export default function Brand({ dark = false }: { dark?: boolean }) {
    return (
        <div className={`brand ${dark ? 'brand-dark' : ''}`}>
            <div className="brand-mark"><span>Q</span></div>
            <div><strong>WILQ</strong><small>Innovation Lab</small></div>
        </div>
    )
}
