/* Topic-page cloze controls.
   A label names the next action: 显示 / 全部显示 while any cloze in
   range is still hidden, 蒙上 / 全部蒙上 only when every one is open. */
(function () {
    const SHOW_ALL = "全部显示";
    const HIDE_ALL = "全部蒙上";
    const SHOW = "显示";
    const HIDE = "蒙上";

    function allRevealed(list) {
        return list.length > 0 && list.every((el) => el.classList.contains("is-on"));
    }

    function setRevealed(list, on) {
        list.forEach((el) => el.classList.toggle("is-on", on));
    }

    function clozesIn(node) {
        if (!node || node.nodeType !== 1) return [];
        const found = [];
        if (node.classList.contains("cloze")) found.push(node);
        found.push(...node.querySelectorAll(".cloze"));
        return found;
    }

    /* 点拨 / 命题分析 are tips, with or without 【】. They are not controls
       and not boundaries, so the previous content heading keeps walking. */
    function isTipHeading(node) {
        if (!node || node.nodeType !== 1) return false;
        const text = node.textContent.replace(/\s+/g, "");
        return text === "点拨" || text === "【点拨】" || text === "命题分析" || text === "【命题分析】";
    }

    function isContentBoundary(node, fromTag) {
        if (!node || node.nodeType !== 1 || isTipHeading(node)) return false;
        if (fromTag === "H2") return node.tagName === "H2";
        return node.tagName === "H2" || node.tagName === "H3";
    }

    function blockClozes(heading) {
        const items = clozesIn(heading);
        let el = heading.nextElementSibling;
        while (el && !isContentBoundary(el, heading.tagName)) {
            items.push(...clozesIn(el));
            el = el.nextElementSibling;
        }
        return items;
    }

    function stop(event) {
        event.stopPropagation();
    }

    const pageButton = document.getElementById("cloze-toggle");
    const clozes = [...document.querySelectorAll(".cloze")];
    const sections = [];

    function sync() {
        if (pageButton) pageButton.textContent = allRevealed(clozes) ? HIDE_ALL : SHOW_ALL;
        sections.forEach((section) => {
            section.button.textContent = allRevealed(section.items) ? HIDE : SHOW;
        });
    }

    function toggle(el) {
        el.classList.toggle("is-on");
        sync();
    }

    clozes.forEach((el) => {
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.addEventListener("click", () => toggle(el));
        el.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggle(el);
            }
        });
    });

    if (pageButton) {
        pageButton.addEventListener("click", (event) => {
            stop(event);
            setRevealed(clozes, !allRevealed(clozes));
            sync();
        });
        pageButton.addEventListener("keydown", stop);
    }

    const article = document.querySelector("article.article");
    if (article) {
        article.querySelectorAll("h2, h3").forEach((heading) => {
            if (isTipHeading(heading)) return;
            const items = blockClozes(heading);
            if (!items.length) return;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "section-toggle";
            button.textContent = SHOW;
            button.addEventListener("click", (event) => {
                stop(event);
                setRevealed(items, !allRevealed(items));
                sync();
            });
            button.addEventListener("keydown", stop);
            heading.appendChild(button);
            sections.push({ button, items });
        });
    }

    if (new URLSearchParams(location.search).has("reveal")) setRevealed(clozes, true);
    sync();
})();
