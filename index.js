document.addEventListener('DOMContentLoaded', () => {
    let books = [];
    let chapters = [];
    let currentBookIndex = 0;
    let currentChapterIndex = 0;

    const bookSelect = document.querySelector('#book-selector');
    const chapterSelect = document.querySelector('#chapter-selector');
    const apiKey = window.env.API_KEY; //Linked API key, accessing the environmental variable.
    
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
        return fetch(`https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/books/${bookId}/chapters`, {
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
                currentChapterIndex = 0; // Reset the chapter index
                loadChapter(chapters[currentChapterIndex].id); // Load the first chapter
                console.log('Fetched chapters for bookId:', bookId, chapters);
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
                console.log('Loaded chapterId:', chapterId, selection);
            })
            .catch(error => console.error('Error loading chapter', error));
    };

    const nextPage = () => {
        currentChapterIndex++;
        if (currentChapterIndex >= chapters.length) {
            currentChapterIndex = 0;
            currentBookIndex++;
            if (currentBookIndex >= books.length) {
                currentBookIndex = 0;
            }
            fetchChapters(books[currentBookIndex].id).then(() => {
                loadChapter(chapters[currentChapterIndex].id);
                console.log('Navigated to next book:', books[currentBookIndex].id, books[currentBookIndex].name);
            });
        } else {
            loadChapter(chapters[currentChapterIndex].id);
        }
        console.log('Next page:', currentBookIndex, currentChapterIndex);
    };

    const prevPage = () => {
        currentChapterIndex--;
        if (currentChapterIndex < 0) {
            currentBookIndex--;
            if (currentBookIndex < 0) {
                currentBookIndex = books.length - 1;
            }
            fetchChapters(books[currentBookIndex].id).then(() => {
                currentChapterIndex = chapters.length - 1;
                loadChapter(chapters[currentChapterIndex].id);
                console.log('Navigated to previous book:', books[currentBookIndex].id, books[currentBookIndex].name);
            });
        } else {
            loadChapter(chapters[currentChapterIndex].id);
        }
        console.log('Previous page:', currentBookIndex, currentChapterIndex);
    };

    fetchBooks();

    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);

    bookSelect.addEventListener('change', () => {
        const selectedBookOption = bookSelect.options[bookSelect.selectedIndex];
        const bookId = selectedBookOption.value;
        fetchChapters(bookId);
        currentBookIndex = bookSelect.selectedIndex - 1; // Adjust the index to match the selected book
        console.log('Selected book:', bookId, books[currentBookIndex].name);
    });

    chapterSelect.addEventListener('change', () => {
        const selectedChapterOption = chapterSelect.options[chapterSelect.selectedIndex];
        const chapterId = selectedChapterOption.value;
        loadChapter(chapterId);
        currentChapterIndex = chapterSelect.selectedIndex; // Adjust the index to match the selected chapter
        console.log('Selected chapter:', chapterId);
    });
    
    //title function
    function paragraphTitle (title) {
        const h2 = document.querySelector('h2');
        h2.textContent = title;
        return h2;
    }

    const bookSelector = document.querySelector("#book-selector")
    const chapterSelector = document.querySelector("#chapter-selector")

    //Hover function
    function hover(selectorId) {
        selectorId.addEventListener("mouseenter", (event) => {
            event.target.style.fontWeight = "bold"; // Change color of the whole container
        });
    
        selectorId.addEventListener("mouseleave", (event) => {
            event.target.style.fontWeight = "normal";
        });
    }
    hover(bookSelector);
    hover(chapterSelector);

    // Translation
    function stripHtml(html) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        const verseNumberSpans = doc.querySelectorAll('span.v');
        verseNumberSpans.forEach(span => {
            span.classList.add('verse-number');
        });
        return doc.body.innerHTML || "";
    }

});
