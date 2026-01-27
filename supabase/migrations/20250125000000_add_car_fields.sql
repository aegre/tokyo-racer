-- Add brand, model, year, and chassis columns to mandatory_cars
-- This normalizes the car data structure for better querying and display

-- Add new columns (nullable initially, will be populated from name)
ALTER TABLE mandatory_cars
	ADD COLUMN IF NOT EXISTS brand TEXT,
	ADD COLUMN IF NOT EXISTS model TEXT,
	ADD COLUMN IF NOT EXISTS year TEXT,
	ADD COLUMN IF NOT EXISTS chassis TEXT;

-- Function to parse car name into components
-- This matches the JavaScript parsing logic in cars.astro
CREATE OR REPLACE FUNCTION parse_car_name(car_name TEXT)
RETURNS TABLE(brand TEXT, model TEXT, year TEXT, chassis TEXT) AS $$
DECLARE
	v_brand TEXT;
	v_model TEXT;
	v_year TEXT;
	v_chassis TEXT;
BEGIN
	-- Extract brand (first word(s), usually uppercase)
	v_brand := (regexp_match(car_name, '^([A-Z]+(?:\s+[A-Z]+)?)'))[1];
	
	-- Extract year (format: 'XX or 'XXXX)
	v_year := (regexp_match(car_name, '''(\d{2,4})'))[1];
	
	-- Extract chassis code (format: (XXXXX))
	v_chassis := (regexp_match(car_name, '\(([A-Z0-9]+)\)'))[1];
	
	-- Extract model (everything between brand and year/chassis)
	v_model := car_name;
	IF v_brand IS NOT NULL THEN
		v_model := regexp_replace(v_model, '^' || regexp_replace(v_brand, '([()\[\]{}])', '\\\1', 'g') || '\s*', '', 'g');
	END IF;
	IF v_year IS NOT NULL THEN
		v_model := regexp_replace(v_model, '''?\d{2,4}', '', 'g');
	END IF;
	IF v_chassis IS NOT NULL THEN
		v_model := regexp_replace(v_model, '\s*\([^)]+\)', '', 'g');
	END IF;
	v_model := trim(regexp_replace(v_model, '\s+', ' ', 'g'));
	
	-- Handle special case: "MITSUBISHI (any car)"
	IF car_name LIKE 'MITSUBISHI%' AND v_chassis IS NULL THEN
		v_brand := 'MITSUBISHI';
		v_model := '(any car)';
		v_year := NULL;
		v_chassis := NULL;
	END IF;
	
	RETURN QUERY SELECT v_brand, v_model, v_year, v_chassis;
END;
$$ LANGUAGE plpgsql;

-- Populate the new columns from existing name data
UPDATE mandatory_cars
SET
	brand = parsed.brand,
	model = parsed.model,
	year = parsed.year,
	chassis = parsed.chassis
FROM (
	SELECT
		id,
		(parse_car_name(name)).brand AS brand,
		(parse_car_name(name)).model AS model,
		(parse_car_name(name)).year AS year,
		(parse_car_name(name)).chassis AS chassis
	FROM mandatory_cars
) AS parsed
WHERE mandatory_cars.id = parsed.id;

-- Make brand and model NOT NULL (since they should always exist)
-- Year and chassis can remain nullable (not all cars have them)
ALTER TABLE mandatory_cars
	ALTER COLUMN brand SET NOT NULL,
	ALTER COLUMN model SET NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mandatory_cars_brand ON mandatory_cars(brand);
CREATE INDEX IF NOT EXISTS idx_mandatory_cars_year ON mandatory_cars(year);

-- Drop the parsing function (no longer needed after migration)
DROP FUNCTION IF EXISTS parse_car_name(TEXT);

-- Add comments to document the structure
COMMENT ON COLUMN mandatory_cars.brand IS 'Car manufacturer (e.g., NISSAN, HONDA)';
COMMENT ON COLUMN mandatory_cars.model IS 'Car model name (e.g., FAIRLADY Z Version)';
COMMENT ON COLUMN mandatory_cars.year IS 'Model year (e.g., 05, 22, 2024)';
COMMENT ON COLUMN mandatory_cars.chassis IS 'Chassis code (e.g., Z33, FL5, RZ34)';
