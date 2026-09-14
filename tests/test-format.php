<?php

/**
 * Tests for the output formatting helpers in includes/functions_format.php.
 */
class Test_Format extends WP_UnitTestCase
{
    public function test_format_address_strips_usa_and_joins_state_zip()
    {
        // The USA suffix is dropped and the state/zip is merged onto the city line.
        $out = tsml_format_address('123 Main St, Chicago, IL 60601, USA');
        $this->assertSame('123 Main St<br>Chicago, IL 60601', $out);
    }

    public function test_format_address_street_only_returns_first_part()
    {
        $out = tsml_format_address('123 Main St, Chicago, IL 60601, USA', true);
        $this->assertSame('123 Main St', $out);
    }

    public function test_format_address_without_usa_is_unchanged()
    {
        $out = tsml_format_address('123 Main St, Chicago, IL 60601');
        $this->assertSame('123 Main St<br>Chicago<br>IL 60601', $out);
    }

    public function test_format_time_special_cases()
    {
        $this->assertSame('Noon', tsml_format_time('12:00'));
        $this->assertSame('Midnight', tsml_format_time('23:59'));
        $this->assertSame('Midnight', tsml_format_time('00:00'));
        $this->assertSame('Appointment', tsml_format_time(''));
    }

    public function test_format_time_uses_wp_time_format()
    {
        update_option('time_format', 'g:i a');
        $this->assertSame('6:30 pm', tsml_format_time('18:30'));
    }

    public function test_format_time_reverse_parses_to_24_hour()
    {
        $this->assertSame('18:30', tsml_format_time_reverse('6:30 pm'));
        $this->assertSame('09:05', tsml_format_time_reverse('9:05 am'));
    }

    public function test_format_day_and_time_appointment_when_no_time()
    {
        $this->assertSame('Appointment', tsml_format_day_and_time(0, ''));
        $this->assertSame('Appt', tsml_format_day_and_time(0, '', ', ', true));
    }

    public function test_format_day_and_time_combines_day_and_time()
    {
        update_option('time_format', 'g:i a');
        update_option('start_of_week', 0);
        tsml_load_config();
        $out = tsml_format_day_and_time(0, '18:30');
        $this->assertStringContainsString('Sunday', $out);
        $this->assertStringContainsString('6:30 pm', $out);
    }

    public function test_format_domain_strips_www_and_scheme()
    {
        $this->assertSame('groupname.org', tsml_format_domain('https://www.groupname.org/path'));
        $this->assertSame('groupname.org', tsml_format_domain('http://groupname.org'));
    }

    public function test_format_name_appends_flagged_types()
    {
        $out = tsml_format_name('Test Meeting', ['M']);
        $this->assertSame('Test Meeting <small>Men</small>', $out);
    }

    public function test_format_name_without_flagged_types_is_unchanged()
    {
        $this->assertSame('Test Meeting', tsml_format_name('Test Meeting', ['D']));
        $this->assertSame('Test Meeting', tsml_format_name('Test Meeting', null));
    }

    public function test_format_name_omits_tc_when_online()
    {
        // An online meeting that is also flagged temporarily closed should show
        // "Online Meeting" but not "Location Temporarily Closed".
        $out = tsml_format_name('Test Meeting', ['TC', 'ONL']);
        $this->assertStringContainsString('Online Meeting', $out);
        $this->assertStringNotContainsString('Location Temporarily Closed', $out);
    }

    public function test_format_types_excludes_tc_and_onl()
    {
        $out = tsml_format_types(['M', 'TC', 'ONL']);
        $this->assertSame('Men', $out);
    }
}
