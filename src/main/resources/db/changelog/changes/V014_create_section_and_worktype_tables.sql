  CREATE TABLE work_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE
  );

  CREATE TABLE sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      project_id UUID REFERENCES projects(id)
  );
  
  
