CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS person (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(255) NOT NULL,
    birthdate DATE,
    photo_url TEXT,
    location VARCHAR(255),
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_person_id INT NOT NULL,
    to_person_id INT NOT NULL,
    relationship_type ENUM(
        'parent',
        'child',
        'sibling',
        'spouse',
        'grandparent',
        'grandchild',
        'uncle',
        'aunt',
        'cousin'
    ) NOT NULL,
    FOREIGN KEY (from_person_id) REFERENCES person(id) ON DELETE CASCADE,
    FOREIGN KEY (to_person_id) REFERENCES person(id) ON DELETE CASCADE,
    UNIQUE (from_person_id, to_person_id, relationship_type)
);
