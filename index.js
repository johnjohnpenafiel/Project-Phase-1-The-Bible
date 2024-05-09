document.addEventListener('DOMContentLoaded', () => {
    let books = [];
    let chapters = [];
    let currentBookIndex = 0;
    let currentChapterIndex = 0;

    const bookSelect = document.querySelector('#book-selector');
    const chapterSelect = document.querySelector('#chapter-selector');
    const apiKey = window.env.API_KEY; //Linked API key, accecing the enviromental variable.
    
    const fetchBooks = () => {
        fetch("https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/books", {
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                books = data.data;
                books.forEach(book => {
                    const option = document.createElement('option');
                    option.textContent = book.name;
                    option.value = book.id; // Set the value of the option to the book ID
                    bookSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading books', error));
    };

    const fetchChapters = (bookId) => {
        fetch(`https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/books/${bookId}/chapters`, {
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                chapters = data.data;
                chapterSelect.innerHTML = ''; // Clear previous options
                chapters.forEach(chapter => {
                    const chapterOption = document.createElement('option');
                    chapterOption.textContent = chapter.number;
                    chapterOption.value = chapter.id; // Set the value of the option to the chapter ID
                    chapterSelect.appendChild(chapterOption);
                });
            })
            .catch(error => console.error('Error loading chapters', error));
    };

    const loadChapter = (chapterId) => {
        fetch(`https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/chapters/${chapterId}`, {
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                const selection = data.data;
                const article = document.querySelector('#chapter-section');
                article.innerHTML = "";
                const p = document.createElement('p');
                p.innerHTML = stripHtml(selection.content);
                p.classList.add('verse-text');
                article.appendChild(p);
                paragraphTitle(selection.reference);
            })
            .catch(error => console.error('Error loading chapter', error));
    };

    const nextPage = () => {
        currentChapterIndex++; // Increment the index of the current chapter.
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = 0;
            currentBookIndex++;
            if (currentBookIndex >= books.length) {
                currentBookIndex = 0;
            }
            fetchChapters(books[currentBookIndex].id);
        }
        loadChapter(chapters[currentChapterIndex].id);
    };

    const prevPage = () => {
        currentChapterIndex--;
        if (currentChapterIndex < 0) {
            currentBookIndex--;
            if (currentBookIndex < 0) {
                currentBookIndex = books.length - 1;
            }
            fetchChapters(books[currentBookIndex].id);
            currentChapterIndex = chapters.length - 1;
        }
        loadChapter(chapters[currentChapterIndex].id);
    };

    fetchBooks();

    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);

    bookSelect.addEventListener('change', () => {
        const selectedBookOption = bookSelect.options[bookSelect.selectedIndex];
        const bookId = selectedBookOption.value;
        fetchChapters(bookId);
    });

    chapterSelect.addEventListener('change', () => {
        const selectedChapterOption = chapterSelect.options[chapterSelect.selectedIndex];
        const chapterId = selectedChapterOption.value;
        loadChapter(chapterId);
    });

    const selectors = document.querySelector('.selectors');

    selectors.addEventListener("mouseenter", (event) => {
        event.target.style.fontWeight = "bold"; // Change color of the whole container
    });

    selectors.addEventListener("mouseleave", (event) => {
        event.target.style.fontWeight = "normal";
    });

    // Chapter h2 Title function
    function paragraphTitle (title) {
        const h2 = document.querySelector('h2');
        h2.textContent = title
        return h2.append(h2)
    }

});

function stripHtml(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    const verseNumberSpans = doc.querySelectorAll('span.v');
    verseNumberSpans.forEach(span => {
        span.classList.add('verse-number');
    });
    return doc.body.innerHTML || "";
}
