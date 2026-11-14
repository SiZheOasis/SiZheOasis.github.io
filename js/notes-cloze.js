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

    function blockClozes(heading) {
        const stop = heading.tagName === "H2" ? new Set(["H2"]) : new Set(["H2", "H3"]);
        const items = clozesIn(heading);
        let el = heading.nextElementSibling;
        while (el && !stop.has(el.tagName)) {
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
