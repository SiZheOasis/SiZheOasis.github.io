(function () {
    var btn = document.getElementById('fold-toggle');
    if (!btn) return;
    var collapsed = false;
    btn.addEventListener('click', function () {
        collapsed = !collapsed;
        var nodes = document.querySelectorAll('article .note-fold');
        for (var i = 0; i < nodes.length; i++) nodes[i].open = !collapsed;
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        btn.textContent = collapsed ? '展开闭环与概念' : '折叠闭环与概念';
    });
})();
