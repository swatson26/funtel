from django.db import models


class SnotelSite(models.Model):
    """
    Model representing a SNOTEL site.
    """

    site_id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lon = models.FloatField()
    elevation_ft = models.FloatField()

    # class Meta:
    #     app_label = 'datahub.apps.DatahubConfig'

    def __str__(self):
        return self.site_id


class SnotelData(models.Model):
    """
    Model representing data for a specific SNOTEL site at a given timestamp.
    """
    snotel_site = models.ForeignKey(SnotelSite, on_delete=models.CASCADE)
    temp = models.FloatField(null=True)
    snow_depth = models.FloatField(null=True)
    timestamp_local = models.DateTimeField()

    # class Meta:
    #     app_label = 'datahub.apps.DatahubConfig'

    def __str__(self):
        return f"SNOTEL Data for {self.snotel_site.site_id} at {self.timestamp_utc}"
